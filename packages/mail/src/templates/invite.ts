const INVITE_SUBJECT = "You're invited to your organization";

export function inviteTemplate(
	organizationName: string,
	signInUrl: string,
): {
	subject: string;
	text: string;
} {
	return {
		subject: INVITE_SUBJECT,
		text: `You've been invited to join ${organizationName}.

Sign in at: ${signInUrl}

If you did not expect this invitation, you can ignore this email.`,
	};
}

export function candidateInviteTemplate(
	organizationName: string,
	signInUrl: string,
): {
	subject: string;
	text: string;
} {
	return {
		subject: `You've been invited to join ${organizationName}'s talent community`,
		text: `You've been invited to join ${organizationName}'s talent community.

Complete your profile and start applying for opportunities:
${signInUrl}

If you did not expect this invitation, you can ignore this email.`,
	};
}
