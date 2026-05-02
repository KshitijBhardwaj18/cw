import type { BadgeVariants } from "@repo/ui/components/badge";

/** Defaults aligned with TimekeepingPolicy / product copy (org can override via API). */
export const TIMEKEEPING_POLICY_DEFAULTS = {
	submissionDeadlineDays: 3,
	reminderIntervalDays: 2,
	autoApproveAfterDays: 3,
} as const;

export const PAY_CODE_BADGE_VARIANT: Record<
	string,
	"outline" | "warning" | "info" | "success"
> = {
	REG: "outline",
	Regular: "outline",
	Training: "outline",
	OT: "warning",
	"Double Time": "warning",
	PTO: "success",
	Holiday: "info",
	Sick: "info",
	Bereavement: "info",
	"Jury Duty": "info",
	"On-Call": "warning",
};

export const WORKER_TYPE_BADGE_VARIANT: Record<string, BadgeVariants> = {
	Contract: "info",
	"Per Diem": "success",
	Travel: "violet",
	Staff: "secondary",
};
