import { Injectable } from "@nestjs/common";
import {
	OrganizationMemberStatus,
	OrganizationVendorStatus,
	User,
	UserRole,
	UserStatus,
} from "@repo/db";
import {
	AfterHook,
	AuthHookContext,
	BeforeHook,
	Hook,
} from "@thallesp/nestjs-better-auth";
import { APIError } from "better-auth/api";
import { resolveUserSubRole } from "src/common/utils/resolve-user-sub-role";
import { PrismaService } from "src/prisma/prisma.service";

@Hook()
@Injectable()
export class AuthHooksService {
	constructor(private readonly prismaService: PrismaService) {}

	@BeforeHook("/sign-in/email-otp")
	async handle(ctx: AuthHookContext) {
		const user = await this.prismaService.user.findUnique({
			where: {
				email: ctx.body.email,
			},
		});
		if (!user) {
			throw new APIError("NOT_FOUND", {
				message: "User not found, please ask admin to invite you",
				code: "USER_NOT_FOUND",
				cause: "User not found, please ask admin to invite you",
			});
		}
		await this.validateUser(user, ctx.body.portal, ctx.body.organizationId);
	}

	@AfterHook("/sign-in/email-otp")
	async afterSignInEmailOtp(ctx: AuthHookContext) {
		const body = ctx.body as {
			email?: string;
			organizationId?: string;
			portal?: string;
		};
		if (!body.organizationId || body.portal === "admin" || !body.email) {
			return;
		}
		const user = await this.prismaService.user.findUnique({
			where: { email: body.email },
			select: { id: true, role: true },
		});
		if (!user) {
			return;
		}
		const latestSession = await this.prismaService.session.findFirst({
			where: { userId: user.id },
			orderBy: { createdAt: "desc" },
			select: { id: true },
		});
		if (!latestSession) {
			return;
		}
		const vendorUser = await this.prismaService.vendorUser.findUnique({
			where: { userId: user.id },
			select: {
				id: true,
				vendorId: true,
				role: true,
				user: { select: { role: true } },
			},
		});
		const vendorSession =
			vendorUser && vendorUser.user.role === UserRole.VENDOR_USER
				? {
						vendorId: vendorUser.vendorId,
						vendorUserId: vendorUser.id,
					}
				: {
						vendorId: null,
						vendorUserId: null,
					};
		const subRole = await resolveUserSubRole(
			this.prismaService,
			user.id,
			user.role,
			body.organizationId,
		);
		await this.prismaService.$transaction([
			this.prismaService.user.update({
				where: { id: user.id },
				data: { subRole },
			}),
			this.prismaService.session.update({
				where: { id: latestSession.id },
				data: {
					activeOrganizationId: body.organizationId,
					...vendorSession,
				},
			}),
		]);
	}

	@BeforeHook("/email-otp/send-verification-otp")
	async handleEmailOtp(ctx: AuthHookContext) {
		const user = await this.prismaService.user.findUnique({
			where: {
				email: ctx.body.email,
			},
		});
		if (!user) {
			throw new APIError("NOT_FOUND", {
				message: "User not found, please ask admin to invite you",
				code: "USER_NOT_FOUND",
				cause: "User not found, please ask admin to invite you",
			});
		}
		await this.validateUser(user, ctx.body.portal, ctx.body.organizationId);
	}

	private async validateUser(
		user: User,
		portal: string,
		organizationId: string,
	) {
		if (user.status === UserStatus.INACTIVE) {
			throw new APIError("UNAUTHORIZED", {
				message: "User is inactive, please ask admin to activate your account",
				code: "USER_INACTIVE",
				cause: "User is inactive, please ask admin to activate your account",
			});
		}
		switch (portal) {
			case "admin":
				await this.validateAdminUser(user);
				return;
			case "candidate":
				await this.validateCandidateUser(user, organizationId);
				return;
			case "auto":
				await this.validateOrgWebUnifiedPortal(user, organizationId);
				return;
			default:
				throw new APIError("UNAUTHORIZED", {
					message: "User is not authorized to sign in to this organization",
					code: "USER_NOT_AUTHORIZED",
					cause: "User is not authorized to sign in to this organization",
				});
		}
	}

	private async validateOrgWebUnifiedPortal(
		user: User,
		organizationId: string,
	) {
		switch (user.role) {
			case UserRole.SUPER_ADMIN:
			case UserRole.GENERAL_ADMIN:
				await this.validateAdminUser(user);
				return;
			case UserRole.OPERATIONS_MANAGER:
			case UserRole.PROGRAM_MANAGER:
			case UserRole.TECHNICAL_MANAGER:
			case UserRole.PROGRAM_VENDOR_MANAGER:
			case UserRole.COMPLIANCE_MANAGER:
			case UserRole.ORGANIZATION_USER:
				await this.validateOrganizationUser(user, organizationId);
				return;
			case UserRole.VENDOR_USER:
				await this.validateVendorUser(user, organizationId);
				return;
			case UserRole.CANDIDATE_USER:
				await this.validateCandidateUser(user, organizationId);
				return;
			default:
				throw new APIError("UNAUTHORIZED", {
					message: "User is not authorized to sign in to this organization",
					code: "USER_NOT_AUTHORIZED",
					cause: "User is not authorized to sign in to this organization",
				});
		}
	}

	private async validateAdminUser(user: User) {
		if (
			["CANDIDATE_USER", "ORGANIZATION_USER", "VENDOR_USER"].includes(user.role)
		) {
			throw new APIError("UNAUTHORIZED", {
				message: "User is not authorized to sign in as admin",
				code: "USER_NOT_AUTHORIZED",
				cause: "User is not authorized to sign in as admin",
			});
		}
	}

	private async validateOrganizationUser(user: User, organizationId: string) {
		const organizationMember = await this.prismaService.member.findFirst({
			where: {
				userId: user.id,
				organizationId: organizationId,
			},
		});
		if (!organizationMember) {
			throw new APIError("NOT_FOUND", {
				message: "You are not a member of this organization",
				code: "USER_NOT_MEMBER_OF_ORGANIZATION",
				cause: "You are not a member of this organization",
			});
		}
		if (organizationMember.status === OrganizationMemberStatus.INACTIVE) {
			throw new APIError("UNAUTHORIZED", {
				message: "You are not active in this organization",
				code: "USER_NOT_ACTIVE_IN_ORGANIZATION",
				cause: "You are not active in this organization",
			});
		}
	}

	private async validateVendorUser(user: User, organizationId: string) {
		const vendorUser = await this.prismaService.vendorUser.findUnique({
			where: { userId: user.id },
			select: { vendorId: true },
		});
		if (!vendorUser) {
			throw new APIError("NOT_FOUND", {
				message: "Vendor profile not found for this user",
				code: "VENDOR_USER_NOT_FOUND",
				cause: "Vendor profile not found for this user",
			});
		}
		const orgVendor = await this.prismaService.organizationVendor.findFirst({
			where: {
				vendorId: vendorUser.vendorId,
				organizationId,
				status: OrganizationVendorStatus.ACTIVE,
			},
			select: { id: true },
		});
		if (!orgVendor) {
			throw new APIError("NOT_FOUND", {
				message: "Your vendor is not linked to this organization",
				code: "VENDOR_NOT_LINKED_TO_ORGANIZATION",
				cause: "Your vendor is not linked to this organization",
			});
		}
	}

	private async validateCandidateUser(user: User, organizationId: string) {
		if (user.role !== "CANDIDATE_USER") {
			throw new APIError("UNAUTHORIZED", {
				message: "User is not authorized to sign in as candidate user",
				code: "USER_NOT_AUTHORIZED",
				cause: "User is not authorized to sign in as candidate user",
			});
		}
		void organizationId;
	}
}
