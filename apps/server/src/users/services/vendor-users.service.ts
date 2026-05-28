import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { MemberRole, type Prisma, VendorUserRole } from "@repo/db";
import { splitFullNameToFirstLast } from "@repo/shared";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { requireActiveOrganizationId } from "src/common/utils/require-active-organization-id";
import type { VendorActorContext } from "src/common/utils/resolve-vendor-actor";
import { resolveVendorActor } from "src/common/utils/resolve-vendor-actor";
import { PrismaService } from "src/prisma/prisma.service";
import {
	CreateVendorUserDto,
	UpdateVendorUserDto,
} from "src/vendors/dto/create-vendor.dto";
import { VendorsService } from "src/vendors/services/vendors.service";
import type {
	CreateVendorPortalUserDto,
	UpdateVendorPortalUserDto,
	VendorPortalUsersQueryDto,
} from "../dto/vendor-user.dto";

const VENDOR_USER_TO_MEMBER_ROLE: Record<VendorUserRole, MemberRole> = {
	[VendorUserRole.VENDOR_MANAGER]: MemberRole.VENDOR_MANAGER,
	[VendorUserRole.VENDOR_USER]: MemberRole.VENDOR_USER,
	[VendorUserRole.VENDOR_VIEW_ONLY]: MemberRole.VENDOR_VIEW_ONLY,
};

function vendorUserRoleToMemberRole(role: VendorUserRole): MemberRole {
	return VENDOR_USER_TO_MEMBER_ROLE[role];
}

export type VendorPortalUserListRow = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	department: string;
	role: string;
	status: "active" | "inactive";
	/** UTC instant of last profile update (formatted in user's TZ on the client). */
	lastActiveAt: string;
};

export type VendorPortalUsersMetrics = {
	totalUsers: number;
	activeUsers: number;
	managerCount: number;
	standardUserCount: number;
	viewOnlyCount: number;
};

export type VendorPortalUsersListResponse = {
	data: VendorPortalUserListRow[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	viewer: {
		vendorId: string;
		vendorUserId: string;
		vendorUserRole: VendorUserRole;
		organizationId: string | null;
	};
};

@Injectable()
export class VendorUsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly vendorsService: VendorsService,
	) {}

	async getVendorContext(session: UserSession) {
		const actor = resolveVendorActor(session);
		this.assertVendorPortalActor(actor);
		const organizationId = session.session.activeOrganizationId ?? null;

		const [vendor, organization] = await Promise.all([
			this.prisma.vendor.findUnique({
				where: { id: actor.vendorId },
				select: { name: true },
			}),
			organizationId
				? this.prisma.organization.findUnique({
						where: { id: organizationId },
						select: { name: true, slug: true },
					})
				: null,
		]);

		return {
			vendorId: actor.vendorId,
			vendorUserId: actor.vendorUserId,
			vendorUserRole: actor.vendorUserRole,
			organizationId,
			vendorName: vendor?.name ?? null,
			organizationName: organization?.name ?? null,
			organizationSlug: organization?.slug ?? null,
		};
	}

	async listUsers(
		session: UserSession,
		query: VendorPortalUsersQueryDto,
	): Promise<VendorPortalUsersListResponse> {
		const actor = resolveVendorActor(session);
		this.assertVendorPortalActor(actor);
		const organizationId = requireActiveOrganizationId(session);
		const page = query.page ?? 1;
		const limit = Math.min(query.limit ?? 20, 100);
		const skip = (page - 1) * limit;

		const where = this.buildVendorUserWhere(
			actor.vendorId,
			organizationId,
			query,
		);

		const [rows, total] = await Promise.all([
			this.prisma.vendorUser.findMany({
				where,
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							phoneNumber: true,
							title: true,
							status: true,
							updatedAt: true,
						},
					},
				},
				orderBy: { user: { name: "asc" } },
				skip,
				take: limit,
			}),
			this.prisma.vendorUser.count({ where }),
		]);

		const totalPages = Math.max(1, Math.ceil(total / limit));

		const data: VendorPortalUserListRow[] = rows.map((vu) => {
			const u = vu.user;
			const { firstName, lastName } = splitFullNameToFirstLast(u.name);
			return {
				id: vu.id,
				firstName,
				lastName,
				email: u.email,
				phone: u.phoneNumber?.trim() ? u.phoneNumber : "—",
				department: u.title?.trim() ? u.title : "—",
				role: vu.role,
				status: u.status === "ACTIVE" ? "active" : "inactive",
				lastActiveAt: u.updatedAt.toISOString(),
			};
		});

		return {
			data,
			total,
			page,
			limit,
			totalPages,
			viewer: {
				vendorId: actor.vendorId,
				vendorUserId: actor.vendorUserId,
				vendorUserRole: actor.vendorUserRole,
				organizationId: session.session.activeOrganizationId ?? null,
			},
		};
	}

	async getUsersMetrics(
		session: UserSession,
	): Promise<VendorPortalUsersMetrics> {
		const actor = resolveVendorActor(session);
		this.assertVendorPortalActor(actor);
		const organizationId = requireActiveOrganizationId(session);
		const vendorId = actor.vendorId;
		const orgMemberFilter: Prisma.VendorUserWhereInput = {
			vendorId,
			user: { members: { some: { organizationId } } },
		};

		const [totalUsers, activeUsers, roleGroups] = await Promise.all([
			this.prisma.vendorUser.count({ where: orgMemberFilter }),
			this.prisma.vendorUser.count({
				where: {
					...orgMemberFilter,
					user: {
						AND: [
							{ status: "ACTIVE" },
							{ members: { some: { organizationId } } },
						],
					},
				},
			}),
			this.prisma.vendorUser.groupBy({
				by: ["role"],
				where: orgMemberFilter,
				_count: { _all: true },
			}),
		]);

		const countFor = (role: string) =>
			roleGroups.find((g) => g.role === role)?._count._all ?? 0;

		return {
			totalUsers,
			activeUsers,
			managerCount: countFor("VENDOR_MANAGER"),
			standardUserCount: countFor("VENDOR_USER"),
			viewOnlyCount: countFor("VENDOR_VIEW_ONLY"),
		};
	}

	async createUser(
		session: UserSession,
		dto: CreateVendorPortalUserDto,
	): Promise<{ vendorId: string; userId: string; role: string }> {
		const actor = resolveVendorActor(session);
		this.assertVendorPortalActor(actor);
		this.assertVendorManager(actor);
		const organizationId = requireActiveOrganizationId(session);
		const { name: title } = await this.assertDepartmentForVendor(
			actor.vendorId,
			dto.departmentId,
		);
		const createDto = {
			firstName: dto.firstName,
			lastName: dto.lastName,
			title,
			email: dto.email,
			mobilePhone: dto.phone?.trim() || undefined,
			role: dto.role,
		} satisfies Pick<
			CreateVendorUserDto,
			"firstName" | "lastName" | "title" | "email" | "role"
		> & { mobilePhone?: string };
		const result = await this.vendorsService.addVendorUser(
			actor.vendorId,
			createDto,
		);
		const existing = await this.prisma.member.findFirst({
			where: { userId: result.userId, organizationId },
			select: { id: true },
		});
		if (!existing) {
			await this.prisma.member.create({
				data: {
					userId: result.userId,
					organizationId,
					role: vendorUserRoleToMemberRole(dto.role),
				},
				select: { id: true },
			});
		}
		return result;
	}

	async updateUser(
		session: UserSession,
		targetVendorUserId: string,
		dto: UpdateVendorPortalUserDto,
	): Promise<{ vendorId: string; vendorUserId: string }> {
		const actor = resolveVendorActor(session);
		this.assertVendorPortalActor(actor);
		this.assertVendorManager(actor);
		if (targetVendorUserId === actor.vendorUserId) {
			throw new ForbiddenException(
				"You cannot update your own account from this screen.",
			);
		}
		const organizationId = requireActiveOrganizationId(session);
		const { name: title } = await this.assertDepartmentForVendor(
			actor.vendorId,
			dto.departmentId,
		);
		const vendorUser = await this.prisma.vendorUser.findFirst({
			where: { id: targetVendorUserId, vendorId: actor.vendorId },
			include: { user: true },
		});
		if (!vendorUser) {
			throw new NotFoundException("User not found.");
		}
		const updateDto = {
			firstName: dto.firstName,
			lastName: dto.lastName,
			title,
			officePhone: null,
			phoneNumber: dto.phone?.trim() || null,
			status: vendorUser.user.status,
			role: dto.role,
		} satisfies Pick<
			UpdateVendorUserDto,
			| "firstName"
			| "lastName"
			| "title"
			| "officePhone"
			| "phoneNumber"
			| "status"
			| "role"
		>;
		const result = await this.vendorsService.updateVendorUser(
			actor.vendorId,
			targetVendorUserId,
			updateDto,
		);
		await this.prisma.member.updateMany({
			where: { userId: vendorUser.userId, organizationId },
			data: { role: vendorUserRoleToMemberRole(dto.role) },
		});
		return result;
	}

	async removeUser(
		session: UserSession,
		targetVendorUserId: string,
	): Promise<{ vendorId: string; vendorUserId: string }> {
		const actor = resolveVendorActor(session);
		this.assertVendorPortalActor(actor);
		this.assertVendorManager(actor);
		if (targetVendorUserId === actor.vendorUserId) {
			throw new ForbiddenException(
				"You cannot remove your own account from the team",
			);
		}
		const organizationId = requireActiveOrganizationId(session);
		const vendorUser = await this.prisma.vendorUser.findFirst({
			where: { id: targetVendorUserId, vendorId: actor.vendorId },
			select: { id: true, userId: true },
		});
		if (!vendorUser) {
			throw new NotFoundException("User not found.");
		}
		await this.prisma.member.deleteMany({
			where: { userId: vendorUser.userId, organizationId },
		});
		return { vendorId: actor.vendorId, vendorUserId: vendorUser.id };
	}

	private assertVendorPortalActor(
		actor: VendorActorContext,
	): asserts actor is VendorActorContext & {
		vendorUserRole: NonNullable<VendorActorContext["vendorUserRole"]>;
	} {
		if (actor.vendorUserRole === null) {
			throw new ForbiddenException("Vendor access required.");
		}
	}

	private assertVendorManager(actor: VendorActorContext): void {
		if (actor.vendorUserRole !== VendorUserRole.VENDOR_MANAGER) {
			throw new ForbiddenException(
				"Only vendor managers can manage team members",
			);
		}
	}

	private async assertDepartmentForVendor(
		vendorId: string,
		departmentId: string,
	): Promise<{ name: string }> {
		const dept = await this.prisma.department.findUnique({
			where: { id: departmentId },
			select: { name: true, organizationId: true },
		});
		if (!dept) {
			throw new NotFoundException("Department not found.");
		}
		const link = await this.prisma.organizationVendor.findFirst({
			where: { vendorId, organizationId: dept.organizationId },
			select: { id: true },
		});
		if (!link) {
			throw new ForbiddenException(
				"This department is not available for your vendor",
			);
		}
		return { name: dept.name };
	}

	private buildVendorUserWhere(
		vendorId: string,
		organizationId: string,
		query: VendorPortalUsersQueryDto,
	): Prisma.VendorUserWhereInput {
		const search = query.search?.trim();

		const userAnd: Prisma.UserWhereInput[] = [
			{ members: { some: { organizationId } } },
		];
		if (query.status) {
			userAnd.push({ status: query.status });
		}
		if (search) {
			userAnd.push({
				OR: [
					{ name: { contains: search, mode: "insensitive" } },
					{ email: { contains: search, mode: "insensitive" } },
					{ title: { contains: search, mode: "insensitive" } },
				],
			});
		}

		return {
			vendorId,
			...(query.role ? { role: query.role } : {}),
			user: { AND: userAnd },
		};
	}
}
