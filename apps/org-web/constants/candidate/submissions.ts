import {
	CheckCircle,
	CheckCircle2,
	Clock,
	FileText,
	Gift,
	Layers,
	Search,
	Users,
	XCircle,
} from "lucide-react";
import type { CandidateComplianceItemStatus } from "@/types/candidate-submission";

export const SUBMISSION_TABS = [
	{
		value: "all-applications",
		label: "All Applications",
		icon: Layers,
	},
	{
		value: "submitted",
		label: "Submitted",
		icon: FileText,
	},
	{
		value: "in-review",
		label: "In Review",
		icon: Search,
	},
	{ value: "interview", label: "Interview", icon: Users },
	{ value: "offer", label: "Offer", icon: Gift },
	{
		value: "accepted",
		label: "Accepted",
		icon: CheckCircle,
	},
	{ value: "rejected", label: "Rejected", icon: XCircle },
] as const;

export type SubmissionTabValue = (typeof SUBMISSION_TABS)[number]["value"];

/** URL query keys for candidate submissions list + tabs. */
export const CANDIDATE_SUBMISSIONS_URL_KEYS = {
	tab: "csubTab",
	page: "csubPage",
	limit: "csubLimit",
	search: "csubSearch",
} as const;

const SUBMISSION_TAB_VALUES = SUBMISSION_TABS.map(
	(t) => t.value,
) as SubmissionTabValue[];

export const SUBMISSION_TAB_VALUE_SET = new Set<string>(SUBMISSION_TAB_VALUES);

export const COMPLIANCE_STATUS_CONFIG: Record<
	CandidateComplianceItemStatus,
	{ tone: "emerald" | "amber" | "red" | "sky"; icon: typeof CheckCircle }
> = {
	APPROVED: { tone: "emerald", icon: CheckCircle2 },
	PENDING_REVIEW: { tone: "amber", icon: Clock },
	MISSING: { tone: "red", icon: XCircle },
	REJECTED: { tone: "red", icon: XCircle },
	EXPIRED: { tone: "sky", icon: XCircle },
};
