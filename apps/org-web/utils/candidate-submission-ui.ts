import type { BadgeVariants } from "@repo/ui/components/badge";
import type { SubmissionStatus } from "@/types/candidate-submission";

export const SUBMISSION_STATUS_BADGE_VARIANT: Record<
	SubmissionStatus,
	BadgeVariants
> = {
	Submitted: "inactive",
	"In Review": "info",
	Interview: "violet",
	Offer: "success",
	Accepted: "lime",
	Rejected: "error",
	Withdrawn: "inactive",
};
