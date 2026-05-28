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
import { resolveActiveOrganizationIdFromRequest } from "src/common/utils/resolve-active-organization-id";
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
				message: "User not found. Ask your admin to invite you.",
				code: "USER_NOT_FOUND",
				cause: "User not found, please ask admin to invite you",
			});
		}
		const organizationId = await resolveActiveOrganizationIdFromRequest(
			this.prismaService,
			ctx.request?.headers ?? ctx.headers,
		);
		await this.validateUser(user, ctx.body.portal, organizationId);
	}

	@AfterHook("/sign-in/email-otp")
	async afterSignInEmailOtp(ctx: AuthHookContext) {
		const body = ctx.body as {
			email?: string;
			portal?: string;
		};
		if (body.portal === "admin" || !body.email) {
			return;
		}
		const organizationId = await resolveActiveOrganizationIdFromRequest(
			this.prismaService,
			ctx.request?.headers ?? ctx.headers,
		);
		if (!organizationId) {
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
			organizationId,
		);
		await this.prismaService.$transaction([
			this.prismaService.user.update({
				where: { id: user.id },
				data: { subRole },
			}),
			this.prismaService.session.update({
				where: { id: latestSession.id },
				data: {
					activeOrganizationId: organizationId,
					...vendorSession,
				},
			}),
		]);
	}

	@AfterHook("/magic-link/verify")
	async afterMagicLinkVerify(ctx: AuthHookContext) {
		const organizationId = await resolveActiveOrganizationIdFromRequest(
			this.prismaService,
			ctx.request?.headers ?? ctx.headers,
		);
		if (!organizationId) return;
		const sessionId = (
			ctx.context as { newSession?: { session?: { id?: string } } }
		).newSession?.session?.id;
		if (!sessionId) return;
		await this.prismaService.session.update({
			where: { id: sessionId },
			data: { activeOrganizationId: organizationId },
		});
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
				message: "User not found. Ask your admin to invite you.",
				code: "USER_NOT_FOUND",
				cause: "User not found, please ask admin to invite you",
			});
		}
		const organizationId = await resolveActiveOrganizationIdFromRequest(
			this.prismaService,
			ctx.request?.headers ?? ctx.headers,
		);
		await this.validateUser(user, ctx.body.portal, organizationId);
	}

	private async validateUser(
		user: User,
		portal: string,
		organizationId: string | null,
	) {
		if (user.status === UserStatus.INACTIVE) {
			const closedCandidate = await this.prismaService.candidate.findFirst({
				where: { userId: user.id, closedAt: { not: null } },
				select: { id: true },
			});
			if (closedCandidate) {
				throw new APIError("NOT_FOUND", {
					message:
						"This account has been closed. Contact support if you'd like to reopen it.",
					code: "ACCOUNT_CLOSED",
					cause: "Candidate closed their account",
				});
			}
			throw new APIError("UNAUTHORIZED", {
				message: "Your account is inactive. Ask your admin to reactivate it.",
				code: "USER_INACTIVE",
				cause: "User is inactive, please ask admin to activate your account",
			});
		}
		switch (portal) {
			case "admin":
				await this.validateAdminUser(user);
				return;
			case "candidate":
				this.assertOrganizationResolved(organizationId);
				await this.validateCandidateUser(user, organizationId);
				return;
			case "auto":
				this.assertOrganizationResolved(organizationId);
				await this.validateOrgWebUnifiedPortal(user, organizationId);
				return;
			default:
				throw new APIError("UNAUTHORIZED", {
					message: "You are not authorized to sign in to this organization.",
					code: "USER_NOT_AUTHORIZED",
					cause: "User is not authorized to sign in to this organization",
				});
		}
	}

	private assertOrganizationResolved(
		organizationId: string | null,
	): asserts organizationId is string {
		if (!organizationId) {
			throw new APIError("BAD_REQUEST", {
				message:
					"This hostname is not associated with any organization. Please use your organization's sign-in URL.",
				code: "ORGANIZATION_NOT_RESOLVED",
				cause: "Organization could not be resolved from request host",
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
					message: "You are not authorized to sign in to this organization.",
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
				message: "You are not authorized to sign in as an admin.",
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
				message: "You are not a member of this organization.",
				code: "USER_NOT_MEMBER_OF_ORGANIZATION",
				cause: "You are not a member of this organization",
			});
		}
		if (organizationMember.status === OrganizationMemberStatus.INACTIVE) {
			throw new APIError("UNAUTHORIZED", {
				message: "You are not active in this organization.",
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
				message: "Vendor profile not found for this user.",
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
				message: "Your vendor is not linked to this organization.",
				code: "VENDOR_NOT_LINKED_TO_ORGANIZATION",
				cause: "Your vendor is not linked to this organization",
			});
		}
		const member = await this.prismaService.member.findFirst({
			where: { userId: user.id, organizationId },
			select: { id: true },
		});
		if (!member) {
			throw new APIError("NOT_FOUND", {
				message: "You are not a member of this organization.",
				code: "USER_NOT_MEMBER_OF_ORGANIZATION",
				cause: "You are not a member of this organization",
			});
		}
	}

	private async validateCandidateUser(user: User, organizationId: string) {
		if (user.role !== "CANDIDATE_USER") {
			throw new APIError("UNAUTHORIZED", {
				message: "You are not authorized to sign in as a candidate.",
				code: "USER_NOT_AUTHORIZED",
				cause: "User is not authorized to sign in as candidate user",
			});
		}
		void organizationId;
	}
}
