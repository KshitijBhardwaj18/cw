import { randomUUID } from "node:crypto";
import type { MessageEvent } from "@nestjs/common";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import {
	$Enums,
	MemberInviteStatus,
	OrganizationMemberStatus,
	type Prisma,
	UserRole,
} from "@repo/db";
import {
	type BulkEnrollmentJobResult,
	S3_PREFIX_BULK_ENROLLMENT,
	splitFullNameToFirstLast,
} from "@repo/shared";
import { Observable, type Subscription } from "rxjs";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { BulkEnrollmentEventsService } from "src/background-jobs/bulk-enrollment-events.service";
import { FilesService } from "src/files/files.service";
import type {
	EnrollExistingUserDto,
	EnrollOrgUserDto,
	OrgMembersQueryDto,
	UpdateOrgMemberDto,
} from "src/organizations/dto/organization-members.dto";
import { PrismaService } from "src/prisma/prisma.service";

const MEMBER_INCLUDE = {
	user: {
		include: {
			vendorUser: { include: { vendor: true } },
		},
	},
} as const;

const ORG_PORTAL_MEMBER_ROLES: ReadonlySet<$Enums.MemberRole> = new Set([
	$Enums.MemberRole.EXECUTIVE,
	$Enums.MemberRole.HIRING_MANAGER,
	$Enums.MemberRole.OPERATIONS,
]);

@Injectable()
export class OrgMembersService {
	private readonly logger = new Logger(OrgMembersService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly filesService: FilesService,
		private readonly backgroundJobsService: BackgroundJobsService,
		private readonly bulkEnrollmentEventsService: BulkEnrollmentEventsService,
	) {}

	private async ensureOrgExists(organizationId: string) {
		const org = await this.prisma.organization.findUnique({
			where: { id: organizationId },
			select: { id: true },
		});
		if (!org) {
			throw new NotFoundException("Organization not found");
		}
	}

	private orgMemberListInclude(organizationId: string) {
		return {
			user: {
				include: {
					vendorUser: { include: { vendor: true } },
					sessions: {
						orderBy: { updatedAt: "desc" as const },
						take: 1,
					},
					departmentUsers: {
						where: { department: { organizationId } },
						select: {
							departmentId: true,
							department: { select: { id: true, name: true } },
						},
					},
				},
			},
		};
	}

	private buildOrgMembersFilter(
		type?:
			| "organization"
			| "program"
			| "vendor"
			| "organization_and_program"
			| "approvers",
	): {
		userRoleFilter?: { equals?: UserRole; not?: UserRole; notIn?: UserRole[] };
		memberRoleFilter?: { not?: $Enums.MemberRole; notIn?: $Enums.MemberRole[] };
	} {
		if (type === "organization")
			return { userRoleFilter: { equals: UserRole.ORGANIZATION_USER } };
		if (type === "vendor")
			return { userRoleFilter: { equals: UserRole.VENDOR_USER } };
		if (type === "program") {
			return {
				userRoleFilter: {
					notIn: [
						UserRole.ORGANIZATION_USER,
						UserRole.VENDOR_USER,
						UserRole.CANDIDATE_USER,
					],
				},
			};
		}
		if (type === "organization_and_program") {
			return {
				userRoleFilter: { not: UserRole.VENDOR_USER },
			};
		}
		if (type === "approvers") {
			return {
				userRoleFilter: { not: UserRole.VENDOR_USER },
				memberRoleFilter: { not: $Enums.MemberRole.EXECUTIVE },
			};
		}
		return {};
	}

	private deriveMemberRole(user: {
		role: UserRole;
		vendorUser: { role: $Enums.VendorUserRole } | null;
	}): $Enums.MemberRole {
		if (user.role === UserRole.VENDOR_USER && user.vendorUser) {
			const map: Record<$Enums.VendorUserRole, $Enums.MemberRole> = {
				VENDOR_MANAGER: $Enums.MemberRole.VENDOR_MANAGER,
				VENDOR_USER: $Enums.MemberRole.VENDOR_USER,
				VENDOR_VIEW_ONLY: $Enums.MemberRole.VENDOR_VIEW_ONLY,
			};
			return map[user.vendorUser.role];
		}

		const programMap: Partial<Record<UserRole, $Enums.MemberRole>> = {
			[UserRole.OPERATIONS_MANAGER]: $Enums.MemberRole.OPERATIONS_MANAGER,
			[UserRole.PROGRAM_MANAGER]: $Enums.MemberRole.PROGRAM_MANAGER,
			[UserRole.TECHNICAL_MANAGER]: $Enums.MemberRole.TECHNICAL_MANAGER,
			[UserRole.PROGRAM_VENDOR_MANAGER]:
				$Enums.MemberRole.PROGRAM_VENDOR_MANAGER,
			[UserRole.COMPLIANCE_MANAGER]: $Enums.MemberRole.COMPLIANCE_MANAGER,
		};

		const role = programMap[user.role];
		if (!role) {
			throw new BadRequestException(
				`Cannot derive an organization role for user role: ${user.role}`,
			);
		}
		return role;
	}

	private async queueMemberInviteEmailAfterEnroll(
		organizationId: string,
		memberId: string,
	): Promise<void> {
		try {
			const job = await this.backgroundJobsService.createInviteSingleJob(
				organizationId,
				memberId,
			);
			await this.prisma.member.update({
				where: { id: memberId },
				data: {
					lastInviteStatus: MemberInviteStatus.PENDING,
					lastInviteScheduledFor: null,
					lastInviteJobId: job.id,
				},
			});
		} catch (err) {
			this.logger.error(
				`Failed to queue org invite email for member ${memberId}: ${
					err instanceof Error ? err.message : String(err)
				}`,
			);
		}
	}

	async enrollOrgUser(organizationId: string, dto: EnrollOrgUserDto) {
		await this.ensureOrgExists(organizationId);

		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email },
			select: { id: true, role: true },
		});

		if (existing) {
			const alreadyMember = await this.prisma.member.findFirst({
				where: { userId: existing.id, organizationId },
				select: { id: true },
			});
			if (alreadyMember) {
				throw new ConflictException(
					"This user is already enrolled in this organization",
				);
			}

			if (existing.role === UserRole.VENDOR_USER) {
				throw new ConflictException(
					"This user cannot be enrolled as an organization user because they are already a vendor user",
				);
			}

			const member = await this.prisma.member.create({
				data: {
					userId: existing.id,
					organizationId,
					role: dto.role,
				},
				include: MEMBER_INCLUDE,
			});
			return member;
		}

		const member = await this.prisma.$transaction(async (tx) => {
			const user = await tx.user.create({
				data: {
					name: `${dto.firstName} ${dto.lastName}`,
					email: dto.email,
					role: UserRole.ORGANIZATION_USER,
					title: dto.title,
					officePhone: dto.officePhone ?? null,
					phoneNumber: dto.phoneNumber ?? null,
				},
			});

			return tx.member.create({
				data: {
					userId: user.id,
					organizationId,
					role: dto.role,
				},
				include: MEMBER_INCLUDE,
			});
		});
		return member;
	}

	async enrollExistingUser(organizationId: string, dto: EnrollExistingUserDto) {
		await this.ensureOrgExists(organizationId);

		const user = await this.prisma.user.findUnique({
			where: { id: dto.userId },
			include: {
				vendorUser: { select: { vendorId: true, role: true } },
			},
		});
		if (!user) {
			throw new NotFoundException("User not found");
		}

		const duplicate = await this.prisma.member.findFirst({
			where: { userId: dto.userId, organizationId },
		});
		if (duplicate) {
			throw new ConflictException(
				"This user is already enrolled in this organization",
			);
		}

		const memberRole = this.deriveMemberRole(user);

		return this.prisma.member.create({
			data: {
				userId: dto.userId,
				organizationId,
				role: memberRole,
			},
			include: MEMBER_INCLUDE,
		});
	}

	async removeMember(organizationId: string, memberId: string) {
		await this.ensureOrgExists(organizationId);
		const member = await this.prisma.member.findFirst({
			where: { id: memberId, organizationId },
			select: { id: true },
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		await this.prisma.member.delete({
			where: { id: memberId },
		});
	}

	async updateOrgMember(
		organizationId: string,
		memberId: string,
		dto: UpdateOrgMemberDto,
		actorUserId: string,
	) {
		await this.ensureOrgExists(organizationId);

		const hasUpdate =
			dto.firstName !== undefined ||
			dto.lastName !== undefined ||
			dto.email !== undefined ||
			dto.title !== undefined ||
			dto.role !== undefined ||
			dto.status !== undefined ||
			dto.departmentIds !== undefined;
		if (!hasUpdate) {
			throw new BadRequestException("No fields to update");
		}

		return this.prisma.$transaction(async (tx) => {
			const member = await tx.member.findFirst({
				where: { id: memberId, organizationId },
				include: { user: { select: { id: true, name: true, role: true } } },
			});
			if (!member) {
				throw new NotFoundException("Member not found");
			}
			if (member.user.role !== UserRole.ORGANIZATION_USER) {
				throw new BadRequestException(
					"Only organization users can be updated with this action",
				);
			}

			if (
				dto.status === OrganizationMemberStatus.INACTIVE &&
				member.userId === actorUserId
			) {
				throw new BadRequestException("You cannot deactivate your own account");
			}

			if (dto.role !== undefined && !ORG_PORTAL_MEMBER_ROLES.has(dto.role)) {
				throw new BadRequestException("Invalid role for an organization user");
			}

			if (dto.email !== undefined) {
				const existing = await tx.user.findFirst({
					where: { email: dto.email, NOT: { id: member.userId } },
					select: { id: true },
				});
				if (existing) {
					throw new ConflictException("Email already in use");
				}
			}

			const userData: {
				name?: string;
				email?: string;
				title?: string | null;
			} = {};

			if (dto.firstName !== undefined || dto.lastName !== undefined) {
				const { firstName: curFirst, lastName: curLast } =
					splitFullNameToFirstLast(member.user.name);
				const first = dto.firstName ?? curFirst;
				const last = dto.lastName ?? curLast;
				userData.name = `${first} ${last}`.trim();
			}
			if (dto.email !== undefined) {
				userData.email = dto.email;
			}
			if (dto.title !== undefined) {
				const t = dto.title.trim();
				userData.title = t === "" ? null : t;
			}

			const memberData: {
				role?: $Enums.MemberRole;
				status?: OrganizationMemberStatus;
			} = {};
			if (dto.role !== undefined) {
				memberData.role = dto.role;
			}
			if (dto.status !== undefined) {
				memberData.status = dto.status;
			}

			if (Object.keys(userData).length > 0) {
				await tx.user.update({
					where: { id: member.userId },
					data: userData,
				});
			}
			if (Object.keys(memberData).length > 0) {
				await tx.member.update({
					where: { id: memberId },
					data: memberData,
				});
			}

			if (dto.departmentIds !== undefined) {
				const orgDepartments = await tx.department.findMany({
					where: { organizationId },
					select: { id: true },
				});
				const orgDeptIds = orgDepartments.map((d) => d.id);
				const valid = new Set(orgDeptIds);
				for (const depId of dto.departmentIds) {
					if (!valid.has(depId)) {
						throw new BadRequestException(
							"One or more departments are not part of this organization",
						);
					}
				}
				await tx.departmentUser.deleteMany({
					where: {
						userId: member.userId,
						departmentId: { in: orgDeptIds },
					},
				});
				if (dto.departmentIds.length > 0) {
					await tx.departmentUser.createMany({
						data: dto.departmentIds.map((departmentId) => ({
							departmentId,
							userId: member.userId,
						})),
					});
				}
			}

			return tx.member.findFirstOrThrow({
				where: { id: memberId },
				include: this.orgMemberListInclude(organizationId),
			});
		});
	}

	async getOrgMembers(organizationId: string, query: OrgMembersQueryDto) {
		const { type, search, page = 1, limit = 10, role: memberRole } = query;
		await this.ensureOrgExists(organizationId);

		const { userRoleFilter, memberRoleFilter } =
			this.buildOrgMembersFilter(type);
		const term = search?.trim();

		const searchFilter = term
			? {
					OR: [
						{
							user: { name: { contains: term, mode: "insensitive" as const } },
						},
						{
							user: { email: { contains: term, mode: "insensitive" as const } },
						},
						{
							user: { title: { contains: term, mode: "insensitive" as const } },
						},
					],
				}
			: undefined;

		let roleWhere: Prisma.MemberWhereInput = {};
		if (memberRole !== undefined && memberRoleFilter) {
			roleWhere = { AND: [{ role: memberRole }, { role: memberRoleFilter }] };
		} else if (memberRole !== undefined) {
			roleWhere = { role: memberRole };
		} else if (memberRoleFilter) {
			roleWhere = { role: memberRoleFilter };
		}

		const where: Prisma.MemberWhereInput = {
			organizationId,
			...roleWhere,
			...(userRoleFilter && { user: { role: userRoleFilter } }),
			...searchFilter,
		};

		const [data, total] = await this.prisma.$transaction([
			this.prisma.member.findMany({
				where,
				include: this.orgMemberListInclude(organizationId),
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * limit,
				take: limit,
			}),
			this.prisma.member.count({ where }),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getOrgProgramUsers(
		organizationId: string,
		search?: string,
		limit = 20,
		cursor?: string,
	) {
		await this.ensureOrgExists(organizationId);

		const term = search?.trim();
		const searchFilter = term
			? {
					OR: [
						{ name: { contains: term, mode: "insensitive" as const } },
						{ email: { contains: term, mode: "insensitive" as const } },
						{ title: { contains: term, mode: "insensitive" as const } },
					],
				}
			: undefined;

		const users = await this.prisma.user.findMany({
			where: {
				role: {
					notIn: [
						UserRole.SUPER_ADMIN,
						UserRole.GENERAL_ADMIN,
						UserRole.VENDOR_USER,
						UserRole.ORGANIZATION_USER,
						UserRole.CANDIDATE_USER,
					],
				},
				NOT: {
					members: { some: { organizationId } },
				},
				...searchFilter,
			},
			orderBy: { name: "asc" },
			take: limit + 1,
			...(cursor && { cursor: { id: cursor }, skip: 1 }),
		});

		const hasMore = users.length > limit;
		return {
			data: hasMore ? users.slice(0, limit) : users,
			nextCursor: hasMore ? users[limit - 1].id : null,
		};
	}

	async getOrgVendorUsers(
		organizationId: string,
		search?: string,
		limit = 20,
		cursor?: string,
	) {
		await this.ensureOrgExists(organizationId);

		const orgVendors = await this.prisma.organizationVendor.findMany({
			where: { organizationId },
			select: { vendorId: true },
		});

		if (orgVendors.length === 0) return { data: [], nextCursor: null };

		const vendorIds = orgVendors.map((ov) => ov.vendorId);

		const term = search?.trim();
		const searchFilter = term
			? {
					OR: [
						{ name: { contains: term, mode: "insensitive" as const } },
						{ email: { contains: term, mode: "insensitive" as const } },
						{ title: { contains: term, mode: "insensitive" as const } },
						{
							vendorUser: {
								vendor: {
									name: { contains: term, mode: "insensitive" as const },
								},
							},
						},
					],
				}
			: undefined;

		const users = await this.prisma.user.findMany({
			where: {
				role: UserRole.VENDOR_USER,
				vendorUser: {
					vendorId: { in: vendorIds },
				},
				NOT: {
					members: { some: { organizationId } },
				},
				...searchFilter,
			},
			include: {
				vendorUser: { include: { vendor: true } },
			},
			orderBy: { name: "asc" },
			take: limit + 1,
			...(cursor && { cursor: { id: cursor }, skip: 1 }),
		});

		const hasMore = users.length > limit;
		return {
			data: hasMore ? users.slice(0, limit) : users,
			nextCursor: hasMore ? users[limit - 1].id : null,
		};
	}

	async submitBulkEnrollment(
		organizationId: string,
		file: Express.Multer.File,
	) {
		await this.ensureOrgExists(organizationId);

		const s3Key = `${S3_PREFIX_BULK_ENROLLMENT}/${organizationId}/${randomUUID()}.csv`;
		await this.filesService.uploadFile(file, s3Key);
		const fileName = file.originalname ?? "enrollment.csv";

		try {
			return await this.backgroundJobsService.createBulkEnrollmentJob(
				organizationId,
				s3Key,
				fileName,
			);
		} catch (error) {
			await this.filesService.deleteFile(s3Key).catch(() => {});
			throw error;
		}
	}

	async getBulkEnrollmentJob(organizationId: string, jobId: string) {
		await this.ensureOrgExists(organizationId);
		return this.backgroundJobsService.getJobById(jobId, organizationId);
	}

	streamBulkEnrollmentJob(
		organizationId: string,
		jobId: string,
	): Observable<MessageEvent> {
		return new Observable<MessageEvent>((subscriber) => {
			let heartbeat: ReturnType<typeof setInterval> | null = null;
			let timeout: ReturnType<typeof setTimeout> | null = null;
			let eventsSub: Subscription | null = null;
			let settled = false;

			const cleanup = () => {
				if (heartbeat !== null) {
					clearInterval(heartbeat);
					heartbeat = null;
				}
				if (timeout !== null) {
					clearTimeout(timeout);
					timeout = null;
				}
				eventsSub?.unsubscribe();
				eventsSub = null;
			};

			const settle = (data: object) => {
				if (settled) return;
				settled = true;
				subscriber.next({ data } as MessageEvent);
				subscriber.complete();
				cleanup();
			};

			this.getBulkEnrollmentJob(organizationId, jobId)
				.then((job) => {
					if (settled) return;

					if (job.status === "COMPLETED") {
						const r = job.result as BulkEnrollmentJobResult | null;
						settle({
							phase: "completed",
							enrolled: r?.enrolled ?? 0,
							skipped: r?.skipped ?? 0,
							failed: r?.failed ?? 0,
							errors: r?.errors,
						});
						return;
					}

					if (job.status === "FAILED") {
						const r = job.result as {
							errors?: Array<{ message: string }>;
						} | null;
						settle({
							phase: "failed",
							message: r?.errors?.[0]?.message ?? "Job failed",
						});
						return;
					}

					subscriber.next({ data: { phase: "processing" } } as MessageEvent);

					heartbeat = setInterval(() => {
						if (!subscriber.closed) {
							subscriber.next({
								data: { phase: "processing" },
							} as MessageEvent);
						}
					}, 20_000);

					timeout = setTimeout(
						() => {
							settle({ phase: "failed", message: "Job timed out" });
						},
						10 * 60 * 1000,
					);

					eventsSub = this.bulkEnrollmentEventsService.events$.subscribe(
						(event) => {
							if (event.jobId !== jobId) return;
							settle(event);
						},
					);
				})
				.catch((error: unknown) => {
					subscriber.error(error);
					cleanup();
				});

			return cleanup;
		});
	}
}
