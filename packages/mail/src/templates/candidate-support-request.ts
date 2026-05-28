import { MAIL_BRAND_COLORS, type MailBranding } from "../branding.js";
import {
	renderEmailLayout,
	renderHeading,
	renderMutedParagraph,
	renderParagraph,
	renderSummaryTable,
} from "./layout.js";
import type { MailTemplateResult } from "./types.js";

export interface CandidateSupportRequestInput {
	candidateName: string;
	candidateEmail: string;
	categoryLabel: string;
	subject: string;
	message: string;
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function renderSectionLabel(text: string): string {
	return `<p style="margin:24px 0 8px;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${MAIL_BRAND_COLORS.muted};">${escapeHtml(text)}</p>`;
}

function renderMessageBlock(message: string): string {
	const escaped = escapeHtml(message).replace(/\n/g, "<br />");
	return `<div style="margin:0 0 8px;padding:16px 18px;border:1px solid ${MAIL_BRAND_COLORS.border};border-radius:12px;background:${MAIL_BRAND_COLORS.otpBackground};color:${MAIL_BRAND_COLORS.text};font-size:14px;line-height:1.6;white-space:pre-wrap;">${escaped}</div>`;
}

export function candidateSupportRequestTemplate(
	branding: MailBranding,
	input: CandidateSupportRequestInput,
): MailTemplateResult {
	const orgName = branding.senderName;
	const candidateLabel = input.candidateName.trim() || input.candidateEmail;
	const subjectLine =
		`Support request: ${input.subject}`.length > 120
			? `Support request from ${candidateLabel}`
			: `Support request: ${input.subject}`;

	const text = [
		`New candidate support request for ${orgName}`,
		"",
		`From: ${candidateLabel} <${input.candidateEmail}>`,
		`Category: ${input.categoryLabel}`,
		`Subject: ${input.subject}`,
		"",
		"Message:",
		input.message,
		"",
		"You can reply directly to this email to respond to the candidate.",
	].join("\n");

	const contentHtml = [
		renderHeading("New candidate support request"),
		renderParagraph(
			`${candidateLabel} submitted a support request on the ${orgName} candidate portal.`,
		),
		renderSummaryTable([
			{ label: "From", value: candidateLabel },
			{ label: "Email", value: input.candidateEmail },
			{ label: "Category", value: input.categoryLabel },
			{ label: "Subject", value: input.subject, highlight: true },
		]),
		renderSectionLabel("Message"),
		renderMessageBlock(input.message),
		renderMutedParagraph(
			"Reply directly to this email to respond to the candidate.",
		),
	].join("");

	return {
		subject: subjectLine,
		text,
		html: renderEmailLayout(branding, contentHtml),
	};
}
