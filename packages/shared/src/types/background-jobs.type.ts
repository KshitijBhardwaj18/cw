export type BulkEnrollmentFilePayload = {
	jobId: string;
	organizationId: string;
	s3Key: string;
	fileName: string;
};

export type BulkPlatformUsersFilePayload = {
	jobId: string;
	s3Key: string;
	fileName: string;
};

export type BulkPlatformUsersJobResult = {
	created: number;
	skipped: number;
	failed: number;
	errors: Array<{ row: number; email?: string; message: string }>;
};

export type BulkEnrollmentJobResult = {
	enrolled: number;
	skipped: number;
	failed: number;
	errors: Array<{ row: number; email?: string; message: string }>;
};

export type InviteSinglePayload = {
	jobId: string;
	organizationId: string;
	memberId: string;
};

export type InviteBulkPayload = {
	jobId: string;
	organizationId: string;
	memberIds: string[];
};

export type InviteSingleJobResult = {
	sent: boolean;
	error?: string;
};

export type InviteBulkJobResult = {
	sent: number;
	failed: number;
	errors: Array<{ memberId: string; email?: string; message: string }>;
};

export type InviteCandidatePayload = {
	jobId: string;
	organizationId: string;
	candidateId: string;
	magicLinkUrl: string;
};

export type InviteCandidateJobResult = {
	sent: boolean;
	error?: string;
};

export type PublishScheduledRequisitionPayload = {
	requisitionId: string;
};

export type TimekeepingReminderPayload = {
	jobId: string;
	organizationId: string;
	caseId: string;
	candidateEmail: string;
	candidateName: string;
	workDate: string;
	orgPortalUrl: string;
};

export type TimekeepingBulkReminderPayload = {
	jobId: string;
	organizationId: string;
	caseIds: string[];
};

export type TimekeepingInternalUploadPayload = {
	jobId: string;
	organizationId: string;
	s3Key: string;
	fileName: string;
	uploadedById: string;
	vendorId?: string;
};

export type TimekeepingReminderJobResult = {
	sent: boolean;
	error?: string;
};

export type TimekeepingBulkReminderJobResult = {
	sent: number;
	failed: number;
	errors: Array<{ caseId: string; email?: string; message: string }>;
};

export type TimekeepingUploadJobResult = {
	created: number;
	skipped: number;
	failed: number;
	errors: Array<{ row: number; message: string }>;
};

export type VendorOnboardingReminderPayload = {
	organizationId: string;
	vendorId: string;
	placementId: string;
};

export type SummaryRecomputePayload =
	| { kind: "candidate"; candidateId: string }
	| { kind: "placement"; placementId: string }
	| {
			kind: "timekeeping-week";
			organizationId: string;
			weekEndingDate: string;
	  };

export type BillingGenerateInvoicesPayload = {
	jobId: string;
	organizationId: string;
	periodFrom: string;
	periodTo: string;
};

export type BillingCycleRunPayload = {
	organizationId: string;
};

export type BillingGenerateInvoicesJobResult = {
	createdInvoices: number;
	createdLineItems: number;
	skippedTimesheets: number;
	failedTimesheets: number;
	errors: Array<{ timesheetId?: string; message: string }>;
};

export type MetricSnapshotRecomputePayload = {
	organizationId?: string;
	periodType: "DAILY" | "WEEKLY" | "MONTHLY";
	periodStart?: string;
	periodEnd?: string;
	metricIds?: string[];
};

export type MetricSnapshotRecomputeJobResult = {
	periodType: "DAILY" | "WEEKLY" | "MONTHLY";
	periodStart: string;
	periodEnd: string;
	computedCount: number;
	skippedCount: number;
	errors: Array<{ metricId?: string; message: string }>;
};
