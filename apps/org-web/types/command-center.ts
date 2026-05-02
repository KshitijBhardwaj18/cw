import type {
	CommandCenterWorkforceCounts,
	CommandCenterWorkforceTypeKey,
} from "@repo/shared";
import type { LucideIcon } from "lucide-react";

export type RequisitionPerformanceFilterKey =
	| "slow-time-to-fill"
	| "no-submissions"
	| "low-submissions";

export type CandidateProcessingFilterKey =
	| "overdue-submissions"
	| "aging-qualified"
	| "aging-shortlisted"
	| "overdue-offers"
	| "delayed-onboarding";

export type OperationsManagementFilterKey =
	| RequisitionPerformanceFilterKey
	| CandidateProcessingFilterKey;

export type OperationsManagementFilterCategory =
	| "requisition-performance"
	| "candidate-processing-issues";

export interface OperationsFilterStatCardItem<
	T extends OperationsManagementFilterKey = OperationsManagementFilterKey,
> {
	key: T;
	label: string;
	description: string;
	countLabel: string;
	priorityLabel: string;
	priorityClassName: string;
	activeClassName: string;
	countClassName: string;
	iconClassName: string;
	icon: LucideIcon;
}

export interface RequisitionPerformanceTableItem {
	id: string;
	filterKey: RequisitionPerformanceFilterKey;
	requisitionId: string;
	requisitionName: string;
	checklistItem: string;
	daysOpen: number;
	submissions: number;
	status: string;
	// Detail Fields
	category?: string;
	assignedTo?: string;
	progress?: number;
	dueDate?: string;
	daysOverdue?: number;
	priority?: string;
	documents?: {
		name?: string;
		status?: string;
		sub?: string;
		variant?: string;
	}[];
	activity?: {
		action?: string;
		date?: string;
		user?: string;
		status?: string;
	}[];
	reminderPlacementId?: string | null;
}

export interface CandidateProcessingIssueTableItem {
	id: string;
	filterKey: CandidateProcessingFilterKey;
	candidate: string;
	jobTitle: string;
	occupation: string;
	submittedBy: string;
	billRate: string;
}

export type ActiveWorkforceTypeKey = CommandCenterWorkforceTypeKey;

export type WorkforceCardTone = "internal" | "external";

export interface ActiveWorkforceTypeCardItem {
	key: ActiveWorkforceTypeKey;
	label: string;
	tone: WorkforceCardTone;
}

export interface ActiveWorkforceOccupationItem {
	id: string;
	name: string;
}

export interface ActiveWorkforceOccupationsResponse {
	data: ActiveWorkforceOccupationItem[];
}

export type ActiveWorkforceCountsByType = CommandCenterWorkforceCounts;

export interface ActiveWorkforceCountsApiItem {
	occupationId: string;
	counts: ActiveWorkforceCountsByType;
}

export interface ActiveWorkforceCountsResponse {
	data: ActiveWorkforceCountsApiItem[];
}

export type PerformanceDateRangeKey =
	| "last-30-days"
	| "last-quarter"
	| "custom-date-range";

export interface PerformanceDateRangeOption {
	value: PerformanceDateRangeKey;
	label: string;
}

export type PerformanceSummaryStatKey =
	| "active-candidates"
	| "vendor-supplied"
	| "avg-response-time"
	| "fill-rate";

export interface PerformanceSummaryStatCardConfig {
	key: PerformanceSummaryStatKey;
	label: string;
	unitLabel?: string;
	toneClassName: string;
	icon: LucideIcon;
}

export interface PerformanceSummaryStatApiItem {
	key: PerformanceSummaryStatKey;
	value: string;
}

export interface PerformanceSummaryStatsResponse {
	data: PerformanceSummaryStatApiItem[];
}

export type PerformanceMetricType =
	| "RECRUITMENT_EFFICIENCY"
	| "COMPLIANCE"
	| "QUALITY_OF_SERVICE";

export type PerformanceMetricStatus = "MEETING_GOAL" | "BELOW_GOAL";

export interface PerformanceMetricItem {
	id: string;
	type: PerformanceMetricType;
	title: string;
	goal: string;
	current: string;
	status: PerformanceMetricStatus;
}

export interface PerformanceMetricGroupApiItem {
	type: PerformanceMetricType;
	metrics: PerformanceMetricItem[];
}

export interface PerformanceMetricsResponse {
	data: PerformanceMetricGroupApiItem[];
}

export type CommandCenterShiftSummaryKey =
	| "total-shifts"
	| "filled"
	| "open"
	| "in-progress";

export interface CommandCenterShiftSummaryCardConfig {
	key: CommandCenterShiftSummaryKey;
	label: string;
	helperLabel: string;
	cardClassName: string;
	countClassName: string;
	helperClassName: string;
}

export interface CommandCenterShiftLocationApiItem {
	id: string;
	name: string;
	shiftIds: string[];
}

export interface CommandCenterShiftLocationsResponse {
	data: CommandCenterShiftLocationApiItem[];
}

export interface CommandCenterShiftDepartmentOccupationMapItem {
	department: string;
	occupations: string[];
}

export interface CommandCenterShiftFiltersMetaResponse {
	data: {
		departments: string[];
		occupations: string[];
		departmentOccupations: CommandCenterShiftDepartmentOccupationMapItem[];
	};
}

export type HiringFunnelSummaryKey =
	| "submitted"
	| "qualified"
	| "shortlisted"
	| "offers"
	| "rejected"
	| "placed";

export interface HiringFunnelSummaryCardConfig {
	key: HiringFunnelSummaryKey;
	label: string;
	icon: LucideIcon;
	iconClassName: string;
}

export interface HiringFunnelSummaryApiItem {
	key: HiringFunnelSummaryKey;
	value: number;
	helperText: string;
}

export interface HiringFunnelSummaryResponse {
	data: HiringFunnelSummaryApiItem[];
}

export interface HiringFunnelStageMetric {
	count: number;
	conversionRate: number;
}

export interface HiringFunnelJobListingItem {
	id: string;
	jobTitle: string;
	status: "open" | "closed";
	location: string;
	department: string;
	submitted: number;
	qualified: HiringFunnelStageMetric;
	shortlisted: HiringFunnelStageMetric;
	offers: HiringFunnelStageMetric;
	rejected: HiringFunnelStageMetric;
	placed: HiringFunnelStageMetric;
}
