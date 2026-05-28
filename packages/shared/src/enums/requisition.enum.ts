export enum RequisitionStatus {
	DRAFT = "DRAFT",
	PENDING_APPROVAL = "PENDING_APPROVAL",
	SCHEDULED = "SCHEDULED",
	PUBLISHED = "PUBLISHED",
	FILLED = "FILLED",
	CANCELLED = "CANCELLED",
}

/** Mirrors Prisma `RequisitionType`. Keep synchronized with schema.prisma. */
export enum RequisitionType {
	LONG_TERM_ORDER = "LONG_TERM_ORDER",
	PER_DIEM = "PER_DIEM",
	PERMANENT_ROLE = "PERMANENT_ROLE",
	INTERNAL_FLEX_POOL = "INTERNAL_FLEX_POOL",
}

/** Mirrors Prisma `InterviewType`. Keep synchronized with schema.prisma. */
export enum InterviewType {
	NO_INTERVIEW = "NO_INTERVIEW",
	CLIENT_INTERVIEW = "CLIENT_INTERVIEW",
	INTERNAL_INTERVIEW = "INTERNAL_INTERVIEW",
}

/** Mirrors Prisma `WorkflowType`. Keep synchronized with schema.prisma. */
export enum WorkflowType {
	VENDOR_CANDIDATE = "VENDOR_CANDIDATE",
	VENDOR_ONLY = "VENDOR_ONLY",
	CANDIDATE_ONLY = "CANDIDATE_ONLY",
}
