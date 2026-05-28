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

export function missingTimeReminderTemplate(
	branding: MailBranding,
	candidateName: string,
	workDate: string,
	portalUrl: string,
): MailTemplateResult {
	const orgName = branding.senderName;
	const greeting = candidateName.trim() || "there";
	const subject = `Action required: missing timesheet for ${workDate}`;

	const text = `Hi ${greeting},

This is a reminder that your timesheet for ${workDate} has not been submitted yet.

Please log in to the ${orgName} portal to submit your time entry as soon as possible:
${portalUrl}

If you believe you have already submitted this timesheet or have questions, please contact your supervisor.

Thanks,
${orgName} Timekeeping Team`;

	const contentHtml = [
		renderHeading("Missing timesheet"),
		renderParagraph(`Hi ${greeting},`),
		renderParagraph(
			`Your timesheet for ${workDate} has not been submitted yet.`,
		),
		renderParagraph(
			"Please log in to your portal and submit your time entry as soon as possible.",
		),
		renderEmailButton(portalUrl, "Submit timesheet"),
		renderLinkFallback(portalUrl),
		renderMutedParagraph(
			"If you believe you have already submitted this timesheet or have questions, please contact your supervisor.",
		),
	].join("");

	return {
		subject,
		text,
		html: renderEmailLayout(branding, contentHtml),
	};
}

export function timesheetUploadResultTemplate(
	branding: MailBranding,
	adminName: string,
	fileName: string,
	created: number,
	skipped: number,
	failed: number,
	errors: Array<{ row: number; message: string }>,
): MailTemplateResult {
	const hasErrors = failed > 0;
	const greeting = adminName.trim() || "there";
	const subject = `Timesheet upload ${hasErrors ? "completed with errors" : "completed"}: ${fileName}`;
	const errorLines =
		errors.length > 0
			? `\nRows with errors:\n${errors.map((e) => `  Row ${e.row}: ${e.message}`).join("\n")}`
			: "";

	const text = `Hi ${greeting},

Your timesheet upload "${fileName}" has been processed.

Summary:
Created: ${created}
Skipped (duplicates): ${skipped}
Failed: ${failed}${errorLines}

${hasErrors ? "Please review the errors above and re-upload the affected rows." : "All entries were imported successfully."}

Thanks,
${branding.senderName} Timekeeping Team`;

	const errorRowsHtml =
		errors.length > 0
			? `
<div style="margin:20px 0;padding:16px;background:#FEF2F2;border-radius:12px;border:1px solid #FECACA;">
	<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#991B1B;">Rows with errors</p>
	<ul style="margin:0;padding-left:20px;font-size:13px;color:#7F1D1D;line-height:1.6;">
		${errors.map((e) => `<li>Row ${e.row}: ${e.message.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</li>`).join("")}
	</ul>
</div>`
			: "";

	const contentHtml = [
		renderHeading(
			hasErrors ? "Upload completed with errors" : "Upload completed",
		),
		renderParagraph(`Hi ${greeting},`),
		renderParagraph(`Your timesheet upload "${fileName}" has been processed.`),
		renderSummaryTable([
			{ label: "Created", value: String(created) },
			{ label: "Skipped (duplicates)", value: String(skipped) },
			{
				label: "Failed",
				value: String(failed),
				highlight: hasErrors,
			},
		]),
		errorRowsHtml,
		renderParagraph(
			hasErrors
				? "Please review the errors above and re-upload the affected rows."
				: "All entries were imported successfully.",
		),
	].join("");

	return {
		subject,
		text,
		html: renderEmailLayout(branding, contentHtml),
	};
}
