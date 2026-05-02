import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@repo/db";
import { splitFullNameToFirstLast, VendorUserRole } from "@repo/shared";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { format } from "date-fns";
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

export type VendorPortalUserListRow = {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	department: string;
	role: string;
	status: "active" | "inactive";
	lastActiveLabel: string;
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
		return {
			vendorId: actor.vendorId,
			vendorUserId: actor.vendorUserId,
			vendorUserRole: actor.vendorUserRole,
			organizationId: session.session.activeOrganizationId ?? null,
		};
	}

	async listUsers(
		session: UserSession,
		query: VendorPortalUsersQueryDto,
	): Promise<VendorPortalUsersListResponse> {
		const actor = resolveVendorActor(session);
		this.assertVendorPortalActor(actor);
		const page = query.page ?? 1;
		const limit = Math.min(query.limit ?? 20, 100);
		const skip = (page - 1) * limit;

		const where = this.buildVendorUserWhere(actor.vendorId, query);

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
			return {
				id: vu.id,
				fullName: u.name,
				email: u.email,
				phone: u.phoneNumber?.trim() ? u.phoneNumber : "—",
				department: u.title?.trim() ? u.title : "—",
				role: vu.role,
				status: u.status === "ACTIVE" ? "active" : "inactive",
				lastActiveLabel: this.formatRelativeUpdated(u.updatedAt),
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
		const vendorId = actor.vendorId;

		const [totalUsers, activeUsers, roleGroups] = await Promise.all([
			this.prisma.vendorUser.count({ where: { vendorId } }),
			this.prisma.vendorUser.count({
				where: { vendorId, user: { status: "ACTIVE" } },
			}),
			this.prisma.vendorUser.groupBy({
				by: ["role"],
				where: { vendorId },
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
		const { name: title } = await this.assertDepartmentForVendor(
			actor.vendorId,
			dto.departmentId,
		);
		const { firstName, lastName } = splitFullNameToFirstLast(dto.fullName);
		const last = lastName.trim() || firstName;
		const createDto = {
			firstName,
			lastName: last,
			title,
			email: dto.email,
			mobilePhone: dto.phone?.trim() || undefined,
			role: dto.role,
		} satisfies Pick<
			CreateVendorUserDto,
			"firstName" | "lastName" | "title" | "email" | "role"
		> & { mobilePhone?: string };
		return this.vendorsService.addVendorUser(actor.vendorId, createDto);
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
				"You cannot update your own user from this screen",
			);
		}
		const { name: title } = await this.assertDepartmentForVendor(
			actor.vendorId,
			dto.departmentId,
		);
		const { firstName, lastName } = splitFullNameToFirstLast(dto.fullName);
		const last = lastName.trim() || firstName;
		const vendorUser = await this.prisma.vendorUser.findFirst({
			where: { id: targetVendorUserId, vendorId: actor.vendorId },
			include: { user: true },
		});
		if (!vendorUser) {
			throw new NotFoundException("User not found");
		}
		const updateDto = {
			firstName,
			lastName: last,
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
		return this.vendorsService.updateVendorUser(
			actor.vendorId,
			targetVendorUserId,
			updateDto,
		);
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
		return this.vendorsService.removeVendorUser(
			actor.vendorId,
			targetVendorUserId,
		);
	}

	private assertVendorPortalActor(
		actor: VendorActorContext,
	): asserts actor is VendorActorContext & {
		vendorUserRole: NonNullable<VendorActorContext["vendorUserRole"]>;
	} {
		if (actor.vendorUserRole === null) {
			throw new ForbiddenException("Vendor access required");
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
			throw new NotFoundException("Department not found");
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
		query: VendorPortalUsersQueryDto,
	): Prisma.VendorUserWhereInput {
		const search = query.search?.trim();

		const userAnd: Prisma.UserWhereInput[] = [];
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

		const userWhere: Prisma.UserWhereInput | undefined =
			userAnd.length > 0 ? { AND: userAnd } : undefined;

		return {
			vendorId,
			...(query.role ? { role: query.role } : {}),
			...(userWhere ? { user: userWhere } : {}),
		};
	}

	private formatRelativeUpdated(updatedAt: Date): string {
		const diffMs = Date.now() - updatedAt.getTime();
		const mins = Math.floor(diffMs / 60000);
		if (mins < 1) return "Just now";
		if (mins < 60) return `${mins} min ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
		return format(updatedAt, "MMM d, yyyy");
	}
}
