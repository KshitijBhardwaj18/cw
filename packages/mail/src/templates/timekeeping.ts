export function missingTimeReminderTemplate(
	candidateName: string,
	workDate: string,
	organizationName: string,
	portalUrl: string,
): { subject: string; text: string } {
	return {
		subject: `Action Required: Missing timesheet for ${workDate}`,
		text: `Hi ${candidateName},

		This is a reminder that your timesheet for ${workDate} has not been submitted yet.

		Please log in to the ${organizationName} portal to submit your time entry as soon as possible:
		${portalUrl}

		If you believe you have already submitted this timesheet or have questions, please contact your supervisor.

		Thanks,
		${organizationName} Timekeeping Team`,
	};
}

export function timesheetUploadResultTemplate(
	adminName: string,
	fileName: string,
	created: number,
	skipped: number,
	failed: number,
	errors: Array<{ row: number; message: string }>,
): { subject: string; text: string } {
	const hasErrors = failed > 0;
	const errorLines =
		errors.length > 0
			? `\nRows with errors:\n${errors.map((e) => `  Row ${e.row}: ${e.message}`).join("\n")}`
			: "";

	return {
		subject: `Timesheet upload ${hasErrors ? "completed with errors" : "completed"}: ${fileName}`,
		text: `Hi ${adminName},

		Your timesheet upload "${fileName}" has been processed.

		Summary:
		Created: ${created}
		Skipped (duplicates): ${skipped}
		Failed: ${failed}${errorLines}

		${hasErrors ? "Please review the errors above and re-upload the affected rows." : "All entries were imported successfully."}

		Thanks,
		Timekeeping System`,
	};
}
