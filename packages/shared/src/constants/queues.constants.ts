export const IMPORTS_QUEUE = "imports";
export const BILLING_QUEUE = "billing";
export const NOTIFICATIONS_QUEUE = "notifications";
export const REQUISITIONS_QUEUE = "requisitions";
export const METRICS_QUEUE = "metrics";

export const SUMMARY_PLACEMENT_QUEUE = "summary-placement";
export const SUMMARY_CANDIDATE_QUEUE = "summary-candidate";
export const SUMMARY_TIMEKEEPING_QUEUE = "summary-timekeeping";

export const BULK_INVITE_MAX_RECIPIENTS = 30;

export const BackGroundJobName = {
	BULK_ENROLLMENT: "bulk-enrollment",
	BULK_PLATFORM_USERS: "bulk-platform-users",
	SEND_INVITE_SINGLE: "send-invite-single",
	SEND_INVITE_BULK: "send-invite-bulk",
	SEND_INVITE_CANDIDATE: "send-invite-candidate",
	PUBLISH_SCHEDULED_REQUISITION: "publish-scheduled-requisition",
	TIMEKEEPING_SEND_REMINDER: "timekeeping-send-reminder",
	TIMEKEEPING_INTERNAL_UPLOAD: "timekeeping-internal-upload",
	VENDOR_ONBOARDING_REMINDER: "vendor-onboarding-reminder-email",
	RECOMPUTE_SUMMARY: "recompute-summary",
	BILLING_GENERATE_INVOICES: "billing-generate-invoices",
	BILLING_CYCLE_RUN: "billing-cycle-run",
	BILLING_REFRESH_SPEND_ANALYTICS: "billing-refresh-spend-analytics",
	METRIC_SNAPSHOT_RECOMPUTE: "metric-snapshot-recompute",
} as const;

export type BackGroundJobType =
	(typeof BackGroundJobName)[keyof typeof BackGroundJobName];
