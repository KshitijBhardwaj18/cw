import type { MailBranding } from "../branding.js";
import {
	renderEmailButton,
	renderEmailLayout,
	renderHeading,
	renderLinkFallback,
	renderMutedParagraph,
	renderParagraph,
	renderSummaryTable,
} from "./layout.js";
import type { MailTemplateResult } from "./types.js";

export function candidateOnboardingReminderTemplate(
	branding: MailBranding,
	input: {
		vendorName: string;
		candidateName: string;
		jobTitle: string;
		startDateLabel: string;
		compliancePercent: number;
		candidatePortalUrl: string;
	},
): MailTemplateResult {
	const orgName = branding.senderName;
	const who = input.candidateName.trim() || "there";
	const role = input.jobTitle.trim() || "your assignment";
	const subject = `${orgName} — please complete your onboarding`;

	const done = input.compliancePercent >= 100;
	const progressLine = done
		? "You're all set on compliance for this assignment."
		: `You're at ${input.compliancePercent}% — please finish any remaining items before you start.`;

	const text = `Hi ${who},

Please complete your onboarding for ${role} at ${orgName}.
Start date: ${input.startDateLabel}

${progressLine}

Open your portal to finish up:
${input.candidatePortalUrl}

Thanks,
${input.vendorName}`;

	const contentHtml = [
		renderHeading("Complete your onboarding"),
		renderParagraph(`Hi ${who},`),
		renderParagraph(
			`Please complete your onboarding for ${role} at ${orgName}.`,
		),
		renderSummaryTable([
			{ label: "Start date", value: input.startDateLabel },
			{
				label: "Compliance progress",
				value: done ? "Complete" : `${input.compliancePercent}%`,
				highlight: !done,
			},
		]),
		renderParagraph(progressLine),
		renderEmailButton(input.candidatePortalUrl, "Open your portal"),
		renderLinkFallback(input.candidatePortalUrl),
		renderMutedParagraph(`Thanks, ${input.vendorName}`),
	].join("");

	return {
		subject,
		text,
		html: renderEmailLayout(branding, contentHtml),
	};
}
