import {
	AlertCircle,
	CircleX,
	Clock3,
	TriangleAlert,
	UserRoundSearch,
	UsersRound,
	UserX,
} from "lucide-react";
import type {
	ActiveWorkforceTypeCardItem,
	CandidateProcessingFilterKey,
	OperationsFilterStatCardItem,
	RequisitionPerformanceFilterKey,
} from "@/types/command-center";

export const REQUISITION_PERFORMANCE_STAT_CARDS: OperationsFilterStatCardItem<RequisitionPerformanceFilterKey>[] =
	[
		{
			key: "slow-time-to-fill",
			label: "Slow Time to Fill",
			description: ">14 days open",
			countLabel: "requisitions",
			priorityLabel: "Medium Priority",
			priorityClassName: "bg-amber-100 text-amber-700",
			activeClassName: "ring-2 ring-primary border-primary",
			countClassName: "text-amber-700",
			iconClassName: "text-amber-500",
			icon: Clock3,
		},
		{
			key: "no-submissions",
			label: "No Submissions",
			description: ">7 days, 0 candidates",
			countLabel: "requisitions",
			priorityLabel: "High Priority",
			priorityClassName: "bg-red-100 text-red-700",
			activeClassName: "ring-2 ring-primary border-primary",
			countClassName: "text-red-700",
			iconClassName: "text-red-500",
			icon: CircleX,
		},
		{
			key: "low-submissions",
			label: "Low Submissions",
			description: "<3 candidates",
			countLabel: "requisitions",
			priorityLabel: "Medium Priority",
			priorityClassName: "bg-amber-100 text-amber-700",
			activeClassName: "ring-2 ring-primary border-primary",
			countClassName: "text-amber-700",
			iconClassName: "text-amber-500",
			icon: TriangleAlert,
		},
	];

export const CANDIDATE_PROCESSING_ISSUE_STAT_CARDS: OperationsFilterStatCardItem<CandidateProcessingFilterKey>[] =
	[
		{
			key: "overdue-submissions",
			label: "Overdue Submissions",
			description: ">24h review deadline",
			countLabel: "candidates",
			priorityLabel: "High Priority",
			priorityClassName: "bg-red-100 text-red-700",
			activeClassName: "ring-2 ring-primary border-primary",
			countClassName: "text-red-700",
			iconClassName: "text-red-500",
			icon: AlertCircle,
		},
		{
			key: "aging-qualified",
			label: "Aging Qualified",
			description: ">72h in Qualified stage",
			countLabel: "candidates",
			priorityLabel: "Medium Priority",
			priorityClassName: "bg-amber-100 text-amber-700",
			activeClassName: "ring-2 ring-primary border-primary",
			countClassName: "text-amber-700",
			iconClassName: "text-amber-500",
			icon: UserRoundSearch,
		},
		{
			key: "aging-shortlisted",
			label: "Aging Shortlisted",
			description: ">168h in Shortlisted stage",
			countLabel: "candidates",
			priorityLabel: "Medium Priority",
			priorityClassName: "bg-amber-100 text-amber-700",
			activeClassName: "ring-2 ring-primary border-primary",
			countClassName: "text-amber-700",
			iconClassName: "text-amber-500",
			icon: UsersRound,
		},
		{
			key: "overdue-offers",
			label: "Overdue Offers",
			description: ">48h response deadline",
			countLabel: "candidates",
			priorityLabel: "Medium Priority",
			priorityClassName: "bg-amber-100 text-amber-700",
			activeClassName: "ring-2 ring-primary border-primary",
			countClassName: "text-amber-700",
			iconClassName: "text-amber-500",
			icon: Clock3,
		},
		{
			key: "delayed-onboarding",
			label: "Delayed / At-Risk Onboarding",
			description: ">5 days delayed",
			countLabel: "candidates",
			priorityLabel: "High Priority",
			priorityClassName: "bg-red-100 text-red-700",
			activeClassName: "ring-2 ring-primary border-primary",
			countClassName: "text-red-700",
			iconClassName: "text-red-500",
			icon: UserX,
		},
	];

export const OPERATIONS_MANAGEMENT_FILTER_DESCRIPTIONS: Record<
	string,
	{ heading: string; description: string }
> = {
	"slow-time-to-fill": {
		heading: "Showing: Slow Time to Fill",
		description: "Requisitions open longer than target fill time",
	},
	"no-submissions": {
		heading: "Showing: No Submissions",
		description: "Open requisitions with zero candidate submissions",
	},
	"low-submissions": {
		heading: "Showing: Low Submissions",
		description: "Requisitions with low submission volume",
	},
	"overdue-submissions": {
		heading: "Showing: Overdue Submissions",
		description: "Candidate submissions requiring review past deadline",
	},
	"aging-qualified": {
		heading: "Showing: Aging Qualified",
		description: "Candidates in Qualified stage exceeding SLA timeframe",
	},
	"aging-shortlisted": {
		heading: "Showing: Aging Shortlisted",
		description: "Candidates in Shortlisted stage past review SLA",
	},
	"overdue-offers": {
		heading: "Showing: Overdue Offers",
		description: "Offer responses that are pending beyond target time",
	},
	"delayed-onboarding": {
		heading: "Showing: Delayed / At-Risk Onboarding",
		description: "Onboarding tasks delayed or at risk of missing start date",
	},
};

export const DEFAULT_OPERATIONS_FILTER_KEY: RequisitionPerformanceFilterKey =
	"slow-time-to-fill";

export const ACTIVE_WORKFORCE_TYPE_CARDS: ActiveWorkforceTypeCardItem[] = [
	{ key: "internal-full-time", label: "Internal-Full Time", tone: "internal" },
	{ key: "internal-part-time", label: "Internal-Part-Time", tone: "internal" },
	{ key: "internal-prn", label: "Internal-PRN", tone: "internal" },
	{
		key: "internal-float-pool",
		label: "Internal-Float Pool",
		tone: "internal",
	},
	{ key: "internal-volunteer", label: "Internal-Volunteer", tone: "internal" },
	{ key: "external-1099", label: "External-1099", tone: "external" },
	{ key: "external-eor", label: "External-EOR", tone: "external" },
	{
		key: "external-vendor-per-diem",
		label: "External-Vendor Per Diem",
		tone: "external",
	},
	{
		key: "external-vendor-lto",
		label: "External-Vendor LTO",
		tone: "external",
	},
];
