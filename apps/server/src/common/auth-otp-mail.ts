import { type PrismaClient, UserRole } from "@repo/db";
import {
	adminMailBranding,
	type MailBranding,
	type MailPortal,
	orgMailBranding,
	sendMail,
	signInOTPTemplate,
} from "@repo/mail";
import type { GenericEndpointContext } from "better-auth";
import { config } from "./config";
import { resolveActiveOrganizationIdFromRequest } from "./utils/resolve-active-organization-id";

export type AuthPortalKind = "admin" | "org";

type OtpRequestBody = {
	portal?: string;
};

type OtpType =
	| "sign-in"
	| "email-verification"
	| "forget-password"
	| "change-email";

type OtpPurpose = "sign-in" | "email-verification" | "forget-password";

const OTP_PURPOSE_MAP: Record<OtpType, OtpPurpose> = {
	"sign-in": "sign-in",
	"email-verification": "email-verification",
	"forget-password": "forget-password",
	"change-email": "email-verification",
};

function resolvePortalFromBody(
	body: OtpRequestBody | undefined,
	userRole: string | null | undefined,
): MailPortal {
	if (body?.portal === "candidate") return "candidate";

	if (body?.portal === "auto" && userRole) {
		if (userRole === UserRole.VENDOR_USER) return "vendor";
		if (userRole === UserRole.CANDIDATE_USER) return "candidate";
	}

	return "organization";
}

async function resolveOtpMailBranding(
	prisma: PrismaClient,
	authPortalKind: AuthPortalKind,
	email: string,
	body: OtpRequestBody | undefined,
	organizationId: string | null,
): Promise<MailBranding> {
	const staffLogicLogoUrl = config.mail.staffLogicLogoUrl;

	if (authPortalKind === "admin" || body?.portal === "admin") {
		return adminMailBranding(staffLogicLogoUrl);
	}

	const [organization, user] = await Promise.all([
		organizationId
			? prisma.organization.findUnique({
					where: { id: organizationId },
					select: { name: true, logo: true },
				})
			: Promise.resolve(null),
		prisma.user.findUnique({
			where: { email },
			select: { role: true, name: true },
		}),
	]);

	return orgMailBranding({
		orgName: organization?.name ?? "Your Organization",
		orgLogoUrl: organization?.logo,
		staffLogicLogoUrl,
		portal: resolvePortalFromBody(body, user?.role),
	});
}

export type SendOtpEmailInput = {
	prisma: PrismaClient;
	authPortalKind: AuthPortalKind;
	email: string;
	otp: string;
	type: OtpType;
	ctx: GenericEndpointContext | undefined;
};

export async function sendOtpVerificationEmail({
	prisma,
	authPortalKind,
	email,
	otp,
	type,
	ctx,
}: SendOtpEmailInput): Promise<void> {
	if (config.environment === "development") {
		console.log(`OTP: ${otp} for email: ${email}`);
		return;
	}

	const body = ctx?.body as OtpRequestBody | undefined;

	const organizationId =
		authPortalKind === "admin"
			? null
			: await resolveActiveOrganizationIdFromRequest(
					prisma,
					ctx?.request?.headers ?? ctx?.headers,
				);

	const [branding, user] = await Promise.all([
		resolveOtpMailBranding(prisma, authPortalKind, email, body, organizationId),
		prisma.user.findUnique({ where: { email }, select: { name: true } }),
	]);

	const { subject, text, html } = signInOTPTemplate({
		recipientLabel: user?.name?.trim() || email,
		otp,
		branding,
		purpose: OTP_PURPOSE_MAP[type] ?? "sign-in",
	});

	await sendMail(config.mail, { to: email, subject, text, html });
}
