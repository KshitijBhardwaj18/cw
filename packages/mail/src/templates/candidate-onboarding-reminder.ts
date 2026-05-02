export function candidateOnboardingReminderTemplate(input: {
	orgName: string;
	vendorName: string;
	candidateName: string;
	jobTitle: string;
	startDateLabel: string;
	compliancePercent: number;
	candidatePortalUrl: string;
}): { subject: string; text: string } {
	const who = input.candidateName.trim() || "there";
	const role = input.jobTitle.trim() || "your assignment";
	const subject = `${input.orgName} - please complete your onboarding`;

	const done = input.compliancePercent >= 100;
	const progressLine = done
		? "You're all set on compliance for this assignment."
		: `You're at ${input.compliancePercent}% - please finish any remaining items before you start.`;

	const text = `Hi ${who},

Please complete your onboarding for ${role} at ${input.orgName}.
Start date: ${input.startDateLabel}

${progressLine}

Open your portal to finish up:
${input.candidatePortalUrl}

Thanks,
${input.vendorName}`;

	return { subject, text };
}
