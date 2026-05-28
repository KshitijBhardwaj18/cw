import type { MailBranding } from "../branding.js";
import {
	renderEmailButton,
	renderEmailLayout,
	renderHeading,
	renderLinkFallback,
	renderMutedParagraph,
	renderParagraph,
} from "./layout.js";
import type { MailTemplateResult } from "./types.js";

export function inviteTemplate(
	branding: MailBranding,
	signInUrl: string,
): MailTemplateResult {
	const orgName = branding.senderName;
	const subject = `You're invited to ${orgName}`;

	const text = `You've been invited to join ${orgName}.

Sign in at: ${signInUrl}

If you did not expect this invitation, you can ignore this email.`;

	const contentHtml = [
		renderHeading("You're invited"),
		renderParagraph(`You've been invited to join ${orgName}.`),
		renderParagraph(
			"Sign in to access your organization portal and get started.",
		),
		renderEmailButton(signInUrl, "Sign in to your account"),
		renderLinkFallback(signInUrl),
		renderMutedParagraph(
			"If you did not expect this invitation, you can ignore this email.",
		),
	].join("");

	return {
		subject,
		text,
		html: renderEmailLayout(branding, contentHtml),
	};
}

export function candidateInviteTemplate(
	branding: MailBranding,
	signInUrl: string,
): MailTemplateResult {
	const orgName = branding.senderName;
	const subject = `Join ${orgName}'s talent community`;

	const text = `You've been invited to join ${orgName}'s talent community.

Complete your profile and start applying for opportunities:
${signInUrl}

If you did not expect this invitation, you can ignore this email.`;

	const contentHtml = [
		renderHeading("Join our talent community"),
		renderParagraph(
			`You've been invited to join ${orgName}'s talent community.`,
		),
		renderParagraph(
			"Complete your profile and start exploring opportunities that match your skills.",
		),
		renderEmailButton(signInUrl, "Complete your profile"),
		renderLinkFallback(signInUrl),
		renderMutedParagraph(
			"If you did not expect this invitation, you can ignore this email.",
		),
	].join("");

	return {
		subject,
		text,
		html: renderEmailLayout(branding, contentHtml),
	};
}
