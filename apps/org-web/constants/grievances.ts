/**
 * Grievance UI constants. Enums mirror `GrievanceType` / `GrievanceStatus` in Prisma.
 */

export const GRIEVANCES_PAGE_SIZE = 10;
/** Mirrors Prisma `GrievanceType`. */
export const GRIEVANCE_TYPE = {
	BEHAVIORAL: "BEHAVIORAL",
	CLINICAL: "CLINICAL",
} as const;
export type GrievanceType =
	(typeof GRIEVANCE_TYPE)[keyof typeof GRIEVANCE_TYPE];

/** Mirrors Prisma `GrievanceStatus`. */
export const GRIEVANCE_STATUS = {
	OPEN: "OPEN",
	IN_PROGRESS: "IN_PROGRESS",
	RESOLVED: "RESOLVED",
} as const;
export type GrievanceStatus =
	(typeof GRIEVANCE_STATUS)[keyof typeof GRIEVANCE_STATUS];

export interface GrievanceListRow {
	id: string;
	organizationId?: string;
	grievanceNumber: string;
	type: GrievanceType;
	candidateId: string;
	workerName: string;
	placementId: string | null;
	placementLabel: string | null;
	description: string;
	status: GrievanceStatus;
	createdAt: string;
}

/** Summary card filter: all grievances, or filter by `GrievanceStatus`. */
export type GrievanceSummaryFilterKey = "ALL" | GrievanceStatus;

export const GRIEVANCE_STAT_CARDS: {
	key: GrievanceSummaryFilterKey;
	label: string;
	hint: string;
	countClass: string;
	activeClass: string;
}[] = [
	{
		key: "ALL",
		label: "Total Grievances",
		hint: "All statuses",
		countClass: "text-foreground",
		activeClass: "border-primary ring-1 ring-primary/20",
	},
	{
		key: GRIEVANCE_STATUS.OPEN,
		label: "Open",
		hint: "Awaiting triage",
		countClass: "text-amber-600 dark:text-amber-500",
		activeClass: "border-amber-500/60 ring-1 ring-amber-500/15",
	},
	{
		key: GRIEVANCE_STATUS.IN_PROGRESS,
		label: "In Progress",
		hint: "Being worked",
		countClass: "text-blue-600 dark:text-blue-400",
		activeClass: "border-blue-500/60 ring-1 ring-blue-500/15",
	},
	{
		key: GRIEVANCE_STATUS.RESOLVED,
		label: "Resolved",
		hint: "Closed out",
		countClass: "text-green-600 dark:text-green-500",
		activeClass: "border-green-500/60 ring-1 ring-green-500/15",
	},
];

export const GRIEVANCE_TYPE_FILTER_OPTIONS: { value: string; label: string }[] =
	[
		{ value: "all", label: "All Types" },
		{ value: GRIEVANCE_TYPE.BEHAVIORAL, label: "Behavioral" },
		{ value: GRIEVANCE_TYPE.CLINICAL, label: "Clinical" },
	];

export const GRIEVANCE_STATUS_FILTER_OPTIONS: {
	value: string;
	label: string;
}[] = [
	{ value: "all", label: "All Statuses" },
	{ value: GRIEVANCE_STATUS.OPEN, label: "Open" },
	{ value: GRIEVANCE_STATUS.IN_PROGRESS, label: "In Progress" },
	{ value: GRIEVANCE_STATUS.RESOLVED, label: "Resolved" },
];

export const GRIEVANCE_TYPE_LABEL: Record<GrievanceType, string> = {
	[GRIEVANCE_TYPE.BEHAVIORAL]: "Behavioral",
	[GRIEVANCE_TYPE.CLINICAL]: "Clinical",
};

export const GRIEVANCE_STATUS_LABEL: Record<GrievanceStatus, string> = {
	[GRIEVANCE_STATUS.OPEN]: "Open",
	[GRIEVANCE_STATUS.IN_PROGRESS]: "In Progress",
	[GRIEVANCE_STATUS.RESOLVED]: "Resolved",
};

export type GrievanceTaskUiState = "pending" | "in_progress" | "completed";

export const GRIEVANCE_TASK_CATEGORY_OPTIONS: {
	value: string;
	label: string;
}[] = [
	{ value: "INVESTIGATION_REQUIRED", label: "Investigation Required" },
	{ value: "DOCUMENTATION_REVIEW", label: "Documentation Review" },
	{ value: "EMPLOYEE_INTERVIEW", label: "Employee Interview" },
	{ value: "CORRECTIVE_ACTION", label: "Corrective Action" },
	{
		value: "PERFORMANCE_IMPROVEMENT_PLAN",
		label: "Performance Improvement Plan",
	},
	{ value: "POLICY_REVIEW", label: "Policy Review" },
	{ value: "TRAINING_REQUIRED", label: "Training Required" },
	{ value: "FOLLOW_UP_MEETING", label: "Follow-up Meeting" },
];

const FLOW_STEPS: GrievanceStatus[] = [
	GRIEVANCE_STATUS.OPEN,
	GRIEVANCE_STATUS.IN_PROGRESS,
	GRIEVANCE_STATUS.RESOLVED,
];

export function getGrievanceFlowStepIndex(status: GrievanceStatus): number {
	return FLOW_STEPS.indexOf(status);
}

export function mapGrievanceTaskStatusToUi(
	status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
): GrievanceTaskUiState {
	if (status === "PENDING") return "pending";
	if (status === "IN_PROGRESS") return "in_progress";
	return "completed";
}

export function nextGrievanceTaskApiStatus(
	current: "PENDING" | "IN_PROGRESS" | "COMPLETED",
): "PENDING" | "IN_PROGRESS" | "COMPLETED" {
	const order: Array<"PENDING" | "IN_PROGRESS" | "COMPLETED"> = [
		"PENDING",
		"IN_PROGRESS",
		"COMPLETED",
	];
	const i = order.indexOf(current);
	return order[(i + 1) % order.length];
}
