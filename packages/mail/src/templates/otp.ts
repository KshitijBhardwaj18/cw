import type { MailBranding } from "../branding.js";
import {
	renderEmailButton,
	renderEmailLayout,
	renderHeading,
	renderMutedParagraph,
	renderOtpBlock,
	renderParagraph,
} from "./layout.js";
import type { MailTemplateResult } from "./types.js";

type OtpPurpose = "sign-in" | "email-verification" | "forget-password";

const OTP_SUBJECTS: Record<OtpPurpose, string> = {
	"sign-in": "Your sign-in verification code",
	"email-verification": "Verify your email address",
	"forget-password": "Reset your password",
};

const OTP_HEADINGS: Record<OtpPurpose, string> = {
	"sign-in": "Sign in to your account",
	"email-verification": "Verify your email",
	"forget-password": "Reset your password",
};

const OTP_INTRO: Record<OtpPurpose, string> = {
	"sign-in": "Use the verification code below to complete your sign-in.",
	"email-verification":
		"Use the verification code below to confirm your email address.",
	"forget-password": "Use the verification code below to reset your password.",
};

export function signInOTPTemplate(input: {
	recipientLabel: string;
	otp: string;
	branding: MailBranding;
	purpose?: OtpPurpose;
}): MailTemplateResult {
	const purpose = input.purpose ?? "sign-in";
	const greeting = input.recipientLabel.trim() || "there";
	const subject = OTP_SUBJECTS[purpose];
	const intro = OTP_INTRO[purpose];

	const text = `Hi ${greeting},

${intro}

Your verification code is: ${input.otp}

This code expires in 5 minutes.

If you did not request this, you can ignore this email.`;

	const contentHtml = [
		renderHeading(OTP_HEADINGS[purpose]),
		renderParagraph(`Hi ${greeting},`),
		renderParagraph(intro),
		renderOtpBlock(input.otp),
		renderMutedParagraph("This code expires in 5 minutes."),
		renderMutedParagraph(
			"If you did not request this, you can safely ignore this email.",
		),
	].join("");

	return {
		subject,
		text,
		html: renderEmailLayout(input.branding, contentHtml),
	};
}

export function resetPasswordTemplate(input: {
	name: string;
	callbackURL: string;
	branding: MailBranding;
}): MailTemplateResult {
	const greeting = input.name.trim() || "there";
	const subject = "Reset your password";

	const text = `Hi ${greeting},

Please reset your password by clicking the link below:
${input.callbackURL}

If you did not request a password reset, you can safely ignore this email.`;

	const contentHtml = [
		renderHeading("Reset your password"),
		renderParagraph(`Hi ${greeting},`),
		renderParagraph(
			"Click the button below to choose a new password for your account.",
		),
		renderEmailButton(input.callbackURL, "Reset password"),
		renderMutedParagraph(
			"If you did not request a password reset, you can safely ignore this email.",
		),
	].join("");

	return {
		subject,
		text,
		html: renderEmailLayout(input.branding, contentHtml),
	};
}
