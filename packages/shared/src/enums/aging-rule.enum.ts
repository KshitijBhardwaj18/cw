/** Mirrors Prisma `AgingRuleStageTransition`. Keep synchronized with schema.prisma. */
export enum AgingRuleStageTransition {
	SUBMISSION_TO_QUALIFIED = "SUBMISSION_TO_QUALIFIED",
	QUALIFIED_TO_SHORTLISTED = "QUALIFIED_TO_SHORTLISTED",
	SHORTLISTED_TO_INTERVIEW_SCHEDULED = "SHORTLISTED_TO_INTERVIEW_SCHEDULED",
	INTERVIEW_SCHEDULED_TO_INTERVIEW_COMPLETED = "INTERVIEW_SCHEDULED_TO_INTERVIEW_COMPLETED",
	INTERVIEW_COMPLETED_TO_OFFER_SENT = "INTERVIEW_COMPLETED_TO_OFFER_SENT",
	OFFER_SENT_TO_OFFER_ACCEPTED = "OFFER_SENT_TO_OFFER_ACCEPTED",
	OFFER_ACCEPTED_TO_ONBOARDING = "OFFER_ACCEPTED_TO_ONBOARDING",
	ONBOARDING_TO_STARTED = "ONBOARDING_TO_STARTED",
	SUBMITTED_TO_REJECTED = "SUBMITTED_TO_REJECTED",
	OFFER_SENT_TO_OFFER_DECLINED = "OFFER_SENT_TO_OFFER_DECLINED",
}

/** Mirrors Prisma `AgingRuleUnit`. Keep synchronized with schema.prisma. */
export enum AgingRuleUnit {
	HOURS = "HOURS",
	DAYS = "DAYS",
}

export type CandidateAgingCardKey =
	| "overdue-submissions"
	| "aging-qualified"
	| "aging-shortlisted"
	| "interview-delayed"
	| "offer-pending"
	| "overdue-offers"
	| "delayed-onboarding";
