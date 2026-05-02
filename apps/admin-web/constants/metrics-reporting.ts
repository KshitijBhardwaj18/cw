import type { MetricType } from "@repo/db";

/** Mock org-level KPI row (frontend-only). */
export type OrgMetricKpi = {
	id: string;
	name: string;
	goalDisplay: string;
	currentDisplay: string;
	trend: "up" | "down" | "flat";
	enabled: boolean;
	/** Raw goal shown in the edit dialog input (before suffix). */
	goalEditValue: string;
	goalInputSuffix: string;
	/** Helper under the input in Edit Goal dialog. */
	goalHelperText: string;
};

export type AgingRuleIndicatorKind =
	| "overdue_submissions"
	| "overdue_offers"
	| "delayed_risk";

export type AgingRuleRow = {
	id: string;
	stageValue: string;
	stageLabel: string;
	overdueAfter: number;
	unit: "Days" | "Hours";
	indicator: AgingRuleIndicatorKind;
	enabled: boolean;
};

export const STAGE_TRANSITION_OPTIONS: { value: string; label: string }[] = [
	{ value: "", label: "Select a stage" },
	{ value: "sub-qual", label: "Submission → Qualified" },
	{ value: "qual-short", label: "Qualified → Shortlisted" },
	{ value: "short-interview", label: "Shortlisted → Interview Scheduled" },
	{
		value: "interview-sched-comp",
		label: "Interview Scheduled → Interview Completed",
	},
	{ value: "interview-offer", label: "Interview Completed → Offer Sent" },
	{ value: "offer-sent-acc", label: "Offer Sent → Offer Accepted" },
	{ value: "acc-onboard", label: "Offer Accepted → Onboarding" },
	{ value: "onboard-started", label: "Onboarding → Started" },
	{ value: "sub-reject", label: "Submitted → Rejected" },
	{ value: "offer-decline", label: "Offer Sent → Offer Declined" },
];

export const AGING_RULE_UNIT_OPTIONS = [
	{ value: "Days", label: "Days" },
	{ value: "Hours", label: "Hours" },
] as const;

const MOCK_RECRUITMENT_KPIS: OrgMetricKpi[] = [
	{
		id: "kpi-reject-pct",
		name: "Rejection Percentage",
		goalDisplay: "15%",
		currentDisplay: "12%",
		trend: "up",
		enabled: true,
		goalEditValue: "15",
		goalInputSuffix: "%",
		goalHelperText: "Enter the target value for this metric",
	},
	{
		id: "kpi-fill-long",
		name: "Fill Rate (Long Term Reqs)",
		goalDisplay: "85%",
		currentDisplay: "88%",
		trend: "up",
		enabled: true,
		goalEditValue: "85",
		goalInputSuffix: "%",
		goalHelperText: "Enter the target value for this metric",
	},
	{
		id: "kpi-fill-shifts",
		name: "Fill Rate (Shifts)",
		goalDisplay: "90%",
		currentDisplay: "87%",
		trend: "down",
		enabled: true,
		goalEditValue: "90",
		goalInputSuffix: "%",
		goalHelperText: "Enter the target value for this metric",
	},
	{
		id: "kpi-submit-offer",
		name: "Submit to Offer Ratio",
		goalDisplay: "0.30",
		currentDisplay: "0.28",
		trend: "flat",
		enabled: true,
		goalEditValue: "0.30",
		goalInputSuffix: "",
		goalHelperText: "Enter the target value for this metric",
	},
	{
		id: "kpi-avg-first-sub",
		name: "Avg Time to 1st Submission",
		goalDisplay: "3 days",
		currentDisplay: "2.5 days",
		trend: "up",
		enabled: true,
		goalEditValue: "3",
		goalInputSuffix: "days",
		goalHelperText: "Enter the target value for this metric",
	},
	{
		id: "kpi-pub-accept",
		name: "Avg Time from Publish to Accept",
		goalDisplay: "14 days",
		currentDisplay: "12 days",
		trend: "up",
		enabled: true,
		goalEditValue: "14",
		goalInputSuffix: "days",
		goalHelperText: "Enter the target value for this metric",
	},
];

const MOCK_COMPLIANCE_KPIS: OrgMetricKpi[] = [
	{
		id: "kpi-lic-compliance",
		name: "Active License Compliance Rate",
		goalDisplay: "98%",
		currentDisplay: "99%",
		trend: "up",
		enabled: true,
		goalEditValue: "98",
		goalInputSuffix: "%",
		goalHelperText: "Enter the target value for this metric",
	},
	{
		id: "kpi-exp-cred",
		name: "Credentials Due Within 30 Days",
		goalDisplay: "12",
		currentDisplay: "9",
		trend: "up",
		enabled: true,
		goalEditValue: "12",
		goalInputSuffix: "",
		goalHelperText: "Enter the maximum count targeted",
	},
	{
		id: "kpi-bg-sla",
		name: "Background Screening SLA Met",
		goalDisplay: "95%",
		currentDisplay: "93%",
		trend: "down",
		enabled: true,
		goalEditValue: "95",
		goalInputSuffix: "%",
		goalHelperText: "Enter the target value for this metric",
	},
	{
		id: "kpi-i9",
		name: "I-9 / Work Authorization Verified",
		goalDisplay: "100%",
		currentDisplay: "100%",
		trend: "flat",
		enabled: true,
		goalEditValue: "100",
		goalInputSuffix: "%",
		goalHelperText: "Enter the target value for this metric",
	},
	{
		id: "kpi-osh",
		name: "OSHA / Safety Training Current",
		goalDisplay: "97%",
		currentDisplay: "96%",
		trend: "down",
		enabled: true,
		goalEditValue: "97",
		goalInputSuffix: "%",
		goalHelperText: "Enter the target value for this metric",
	},
];

const MOCK_QUALITY_KPIS: OrgMetricKpi[] = [
	{
		id: "kpi-nps",
		name: "Net Promoter Score (Client)",
		goalDisplay: "45",
		currentDisplay: "48",
		trend: "up",
		enabled: true,
		goalEditValue: "45",
		goalInputSuffix: "",
		goalHelperText: "Enter the target score for this metric",
	},
	{
		id: "kpi-first-response",
		name: "Avg. First Response Time",
		goalDisplay: "4 hrs",
		currentDisplay: "3.2 hrs",
		trend: "up",
		enabled: true,
		goalEditValue: "4",
		goalInputSuffix: "hrs",
		goalHelperText: "Enter the target response time",
	},
	{
		id: "kpi-escalations",
		name: "Escalations per 100 Placements",
		goalDisplay: "2",
		currentDisplay: "1.4",
		trend: "up",
		enabled: true,
		goalEditValue: "2",
		goalInputSuffix: "",
		goalHelperText: "Enter the target value for this metric",
	},
	{
		id: "kpi-sla-order",
		name: "Order Confirmation Within SLA",
		goalDisplay: "92%",
		currentDisplay: "94%",
		trend: "up",
		enabled: true,
		goalEditValue: "92",
		goalInputSuffix: "%",
		goalHelperText: "Enter the target value for this metric",
	},
	{
		id: "kpi-qbr",
		name: "Quarterly Business Review Completion",
		goalDisplay: "100%",
		currentDisplay: "88%",
		trend: "down",
		enabled: true,
		goalEditValue: "100",
		goalInputSuffix: "%",
		goalHelperText: "Enter the target value for this metric",
	},
];

export const MOCK_KPIS_BY_TYPE: Record<MetricType, OrgMetricKpi[]> = {
	RECRUITMENT_EFFICIENCY: MOCK_RECRUITMENT_KPIS,
	COMPLIANCE: MOCK_COMPLIANCE_KPIS,
	QUALITY_OF_SERVICE: MOCK_QUALITY_KPIS,
};

export const MOCK_AGING_RULES: AgingRuleRow[] = [
	{
		id: "ar-1",
		stageValue: "sub-qual",
		stageLabel: "Submission → Qualified",
		overdueAfter: 3,
		unit: "Days",
		indicator: "overdue_submissions",
		enabled: true,
	},
	{
		id: "ar-2",
		stageValue: "qual-short",
		stageLabel: "Qualified → Shortlisted",
		overdueAfter: 5,
		unit: "Days",
		indicator: "overdue_offers",
		enabled: true,
	},
	{
		id: "ar-3",
		stageValue: "short-interview",
		stageLabel: "Shortlisted → Interview Scheduled",
		overdueAfter: 7,
		unit: "Days",
		indicator: "delayed_risk",
		enabled: true,
	},
];
