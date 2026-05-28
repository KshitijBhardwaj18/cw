import { randomBytes } from "node:crypto";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CandidateInviteStatus, CandidateSource, UserRole } from "@repo/db";
import { getWorkforceBucket, WorkforceBucket } from "@repo/shared";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { auth } from "src/common/auth";
import { config } from "src/common/config";
import { PrismaService } from "src/prisma/prisma.service";
import type { CandidateActivityQueryDto } from "./dto/candidate-activity-query.dto";
import type { InviteCandidateDto } from "./dto/invite-candidate.dto";
import {
	type TalentCommunityQueryDto,
	TalentCommunityTab,
} from "./dto/talent-community-query.dto";
import type { UpdateCandidateWorkforceTypeDto } from "./dto/update-candidate-workforce-type.dto";

const MAGIC_LINK_EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours
const CANDIDATE_ENTITY_TYPE = "Candidate" as const;
const CandidateActivityAction = {
	Invited: "CANDIDATE_INVITED",
	AddedToTalentCommunity: "CANDIDATE_ADDED_TO_TALENT_COMMUNITY",
	WorkforceTypeAssigned: "CANDIDATE_WORKFORCE_TYPE_ASSIGNED",
} as const;

const CANDIDATE_INCLUDE = {
	user: {
		select: { id: true, name: true, email: true, phoneNumber: true },
	},
	occupation: { select: { id: true, name: true, acronym: true } },
	candidateSpecialties: {
		include: { specialty: { select: { id: true, name: true, acronym: true } } },
	},
	candidateTags: {
		orderBy: { id: "asc" as const },
		include: { tag: { select: { id: true, name: true } } },
	},
	vendor: { select: { id: true, name: true } },
	placements: {
		select: { status: true },
		orderBy: { updatedAt: "desc" as const },
		take: 1,
	},
} as const;

const CANDIDATE_PROFILE_INCLUDE = {
	...CANDIDATE_INCLUDE,
	candidateCompliances: {
		select: {
			id: true,
			status: true,
			expiryDate: true,
			updatedAt: true,
			complianceListItem: {
				select: { name: true, category: true },
			},
		},
		orderBy: { updatedAt: "desc" as const },
		take: 20,
	},
} as const;

export type ComplianceSeverity = "ok" | "warning" | "danger";

function complianceStatusSeverity(status: string): ComplianceSeverity {
	if (status === "APPROVED") return "ok";
	if (status === "PENDING") return "warning";
	return "danger";
}

@Injectable()
export class TalentCommunityService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobsService: BackgroundJobsService,
	) {}

	private async getActorMeta(userId: string) {
		const actor = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, name: true },
		});
		return {
			userId: actor?.id ?? userId,
			userEmail: actor?.email ?? null,
			userName: actor?.name ?? null,
		};
	}

	private async ensureOrgExists(orgId: string): Promise<void> {
		const org = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});
		if (!org) {
			throw new NotFoundException("Organization not found.");
		}
	}

	async inviteCandidate(
		orgId: string,
		dto: InviteCandidateDto,
		createdByUserId: string,
		options?: { vendorId?: string },
	) {
		await this.ensureOrgExists(orgId);
		const actorMeta = await this.getActorMeta(createdByUserId);

		if (options?.vendorId) {
			const vendorLink = await this.prisma.organizationVendor.findFirst({
				where: {
					organizationId: orgId,
					vendorId: options.vendorId,
				},
				select: { id: true },
			});
			if (!vendorLink) {
				throw new ForbiddenException(
					"This vendor is not linked to the organization",
				);
			}
		}

		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email },
			select: { id: true, role: true },
		});

		if (existing) {
			if (existing.role !== UserRole.CANDIDATE_USER) {
				throw new ConflictException(
					"This email cannot be added as a candidate.",
				);
			}
			const alreadyCandidate = await this.prisma.candidate.findFirst({
				where: { userId: existing.id, organizationId: orgId },
				select: { id: true },
			});
			if (alreadyCandidate) {
				throw new ConflictException(
					"A candidate with this email already exists in this organization.",
				);
			}
		}

		const candidate = await this.prisma.$transaction(async (tx) => {
			const user = existing
				? await tx.user.findUniqueOrThrow({ where: { id: existing.id } })
				: await tx.user.create({
						data: {
							name: dto.name,
							email: dto.email,
							phoneNumber: dto.phoneNumber,
							role: UserRole.CANDIDATE_USER,
						},
					});

			const newCandidate = await tx.candidate.create({
				data: {
					userId: user.id,
					occupationId: dto.occupationId,
					organizationId: orgId,
					workforceType: dto.workforceType,
					inviteStatus: CandidateInviteStatus.PENDING,
					invitedAt: new Date(),
					createdBy: createdByUserId,
					...(options?.vendorId && {
						vendorId: options.vendorId,
						source: CandidateSource.VENDOR,
					}),
					...(dto.specialtyIds?.length && {
						candidateSpecialties: {
							create: dto.specialtyIds.map((specialtyId) => ({
								specialtyId,
							})),
						},
					}),
				},
				include: CANDIDATE_INCLUDE,
			});

			await tx.candidateSummary.create({
				data: {
					candidateId: newCandidate.id,
					organizationId: orgId,
					vendorId: options?.vendorId ?? null,
					occupationId: dto.occupationId,
					primarySpecialtyId: dto.specialtyIds?.[0] ?? null,
				},
			});

			await tx.activityLogOrg.create({
				data: {
					organizationId: orgId,
					userId: actorMeta.userId,
					userEmail: actorMeta.userEmail,
					userName: actorMeta.userName,
					action: CandidateActivityAction.Invited,
					entityType: CANDIDATE_ENTITY_TYPE,
					entityId: newCandidate.id,
					entityName: user.name,
					description: "Invited candidate",
				},
			});

			return newCandidate;
		});

		const orgSlug = await this.prisma.organization.findUnique({
			where: { id: orgId },
			select: { slug: true },
		});
		if (!orgSlug) {
			throw new NotFoundException("Organization not found.");
		}
		const magicToken = randomBytes(32).toString("base64url"); // 43-char URL-safe string
		const ctx = await auth.$context;
		await ctx.internalAdapter.createVerificationValue({
			identifier: magicToken,
			value: JSON.stringify({ email: dto.email, name: dto.name }),
			expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY_SECONDS * 1000),
		});

		const orgSubdomainOrigin = new URL(
			config.urls.orgPortalBaseUrl.replace("://", `://${orgSlug.slug}.`),
		).origin;
		const callbackUrl = `${orgSubdomainOrigin}/candidate/sign-up?step=0&invite=true`;
		const magicLinkUrl = `${orgSubdomainOrigin}/api/auth/org/magic-link/verify?token=${magicToken}&callbackURL=${encodeURIComponent(callbackUrl)}`;

		await this.backgroundJobsService.createInviteCandidateJob(
			orgId,
			candidate.id,
			magicLinkUrl,
		);

		await this.backgroundJobsService.enqueueCandidateSummary(candidate.id);

		return candidate;
	}

	async findAll(orgId: string, query: TalentCommunityQueryDto) {
		await this.ensureOrgExists(orgId);

		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;

		const searchFilter = query.search
			? {
					OR: [
						{
							user: {
								name: {
									contains: query.search,
									mode: "insensitive" as const,
								},
							},
						},
						{
							occupation: {
								name: {
									contains: query.search,
									mode: "insensitive" as const,
								},
							},
						},
					],
				}
			: {};

		const INVITED_STATUSES = [CandidateInviteStatus.PENDING];

		const notPendingOrNullInviteStatus = {
			OR: [
				{ inviteStatus: { notIn: INVITED_STATUSES } },
				{ inviteStatus: null },
			],
		};

		const tabFilter = (() => {
			switch (query.tab) {
				case TalentCommunityTab.INVITED:
					return { inviteStatus: { in: INVITED_STATUSES } };
				case TalentCommunityTab.NEW_UNASSIGNED:
					return {
						workforceType: null,
						...notPendingOrNullInviteStatus,
					};
				default:
					return {
						workforceType: { not: null },
						...notPendingOrNullInviteStatus,
					};
			}
		})();

		const workforceTypeFilter = query.workforceType
			? { workforceType: query.workforceType }
			: {};

		const inviteStatusFilter =
			query.inviteStatus && query.tab === TalentCommunityTab.INVITED
				? { inviteStatus: query.inviteStatus }
				: {};

		const placementStatusFilter = query.placementStatus
			? { placements: { some: { status: query.placementStatus } } }
			: {};

		const baseWhere = {
			organizationId: orgId,
			...tabFilter,
			...searchFilter,
			...workforceTypeFilter,
			...inviteStatusFilter,
			...placementStatusFilter,
		};

		const [
			data,
			total,
			talentCommunityCount,
			newUnassignedCount,
			invitedCount,
		] = await Promise.all([
			this.prisma.candidate.findMany({
				where: baseWhere,
				include: CANDIDATE_INCLUDE,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			this.prisma.candidate.count({ where: baseWhere }),
			this.prisma.candidate.count({
				where: {
					organizationId: orgId,
					workforceType: { not: null },
					...notPendingOrNullInviteStatus,
				},
			}),
			this.prisma.candidate.count({
				where: {
					organizationId: orgId,
					workforceType: null,
					...notPendingOrNullInviteStatus,
				},
			}),
			this.prisma.candidate.count({
				where: {
					organizationId: orgId,
					inviteStatus: { in: INVITED_STATUSES },
				},
			}),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
			counts: {
				talentCommunity: talentCommunityCount,
				newUnassigned: newUnassignedCount,
				invited: invitedCount,
			},
		};
	}

	async getCandidateProfile(orgId: string, candidateId: string) {
		await this.ensureOrgExists(orgId);

		const candidate = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId: orgId },
			include: CANDIDATE_PROFILE_INCLUDE,
		});
		if (!candidate) {
			throw new NotFoundException("Candidate not found in this organization.");
		}

		const { candidateCompliances, ...rest } = candidate;
		const mappedCompliances = candidateCompliances.map((c) => ({
			id: c.id,
			documentName: c.complianceListItem.name,
			category: c.complianceListItem.category,
			status: c.status,
			severity: complianceStatusSeverity(c.status),
			expiryDate: c.expiryDate,
			updatedAt: c.updatedAt,
		}));
		const verifiedCount = mappedCompliances.filter(
			(c) => c.severity === "ok",
		).length;
		const totalCount = mappedCompliances.length;
		return {
			...rest,
			candidateCompliances: mappedCompliances,
			complianceSummary: {
				total: totalCount,
				verified: verifiedCount,
				allVerified: totalCount > 0 && verifiedCount === totalCount,
			},
		};
	}

	async updateCandidateWorkforceType(
		orgId: string,
		candidateId: string,
		dto: UpdateCandidateWorkforceTypeDto,
		updatedByUserId: string,
	) {
		await this.ensureOrgExists(orgId);
		const actorMeta = await this.getActorMeta(updatedByUserId);

		const candidate = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId: orgId },
			select: { id: true, workforceType: true, vendorId: true },
		});
		if (!candidate) {
			throw new NotFoundException("Candidate not found in this organization.");
		}

		const isExternalWorkforceType =
			getWorkforceBucket(dto.workforceType) === WorkforceBucket.EXTERNAL;
		if (isExternalWorkforceType && !dto.vendorId) {
			throw new BadRequestException(
				"Select a vendor for external/vendor workforce types.",
			);
		}
		if (dto.vendorId) {
			const orgVendor = await this.prisma.organizationVendor.findFirst({
				where: {
					organizationId: orgId,
					vendorId: dto.vendorId,
				},
				select: { id: true },
			});
			if (!orgVendor) {
				throw new NotFoundException(
					"Selected vendor is not linked to this organization",
				);
			}
		}

		const updated = await this.prisma.$transaction(async (tx) => {
			const row = await tx.candidate.update({
				where: { id: candidateId },
				data: {
					workforceType: dto.workforceType,
					vendorId: isExternalWorkforceType ? dto.vendorId : null,
					...(isExternalWorkforceType
						? { source: CandidateSource.VENDOR }
						: {}),
					updatedBy: updatedByUserId,
				},
				include: CANDIDATE_INCLUDE,
			});

			await tx.activityLogOrg.create({
				data: {
					organizationId: orgId,
					userId: actorMeta.userId,
					userEmail: actorMeta.userEmail,
					userName: actorMeta.userName,
					action: CandidateActivityAction.WorkforceTypeAssigned,
					entityType: CANDIDATE_ENTITY_TYPE,
					entityId: candidateId,
					entityName: row.user.name,
					description: "Workforce Type Assigned",
					changes: {
						from: candidate.workforceType,
						to: dto.workforceType,
						fromVendorId: candidate.vendorId,
						toVendorId: isExternalWorkforceType ? dto.vendorId : null,
					},
				},
			});

			return row;
		});

		await this.backgroundJobsService.enqueueCandidateSummary(candidateId);

		return updated;
	}

	async getCandidateActivity(
		orgId: string,
		candidateId: string,
		query: CandidateActivityQueryDto,
	) {
		await this.ensureOrgExists(orgId);

		const candidate = await this.prisma.candidate.findFirst({
			where: { id: candidateId, organizationId: orgId },
			select: { id: true },
		});
		if (!candidate) {
			throw new NotFoundException("Candidate not found in this organization.");
		}

		const limit = query.limit ?? 20;

		return this.prisma.activityLogOrg.findMany({
			where: {
				organizationId: orgId,
				entityType: CANDIDATE_ENTITY_TYPE,
				entityId: candidateId,
				action: {
					in: [
						CandidateActivityAction.Invited,
						CandidateActivityAction.AddedToTalentCommunity,
						CandidateActivityAction.WorkforceTypeAssigned,
					],
				},
			},
			select: {
				id: true,
				action: true,
				description: true,
				changes: true,
				createdAt: true,
			},
			orderBy: { createdAt: "desc" },
			take: limit,
		});
	}
}
