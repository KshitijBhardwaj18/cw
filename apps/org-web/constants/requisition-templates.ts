export const REQUISITION_TEMPLATE_TYPE_OPTIONS = [
	{ value: "LONG_TERM_ORDER", label: "Long-Term Order" },
	{ value: "PER_DIEM", label: "Per Diem" },
	{ value: "PERMANENT_ROLE", label: "Permanent Role" },
	{ value: "INTERNAL_FLEX_POOL", label: "Internal Flex Pool" },
] as const;

export const REQUISITION_TEMPLATE_STATUS_OPTIONS = [
	{ value: "ACTIVE", label: "Active" },
	{ value: "DRAFT", label: "Draft" },
] as const;

export const REQUISITION_STATUS_FILTER_OPTIONS = [
	{ value: "all", label: "All Statuses" },
	{ value: "ACTIVE", label: "Active" },
	{ value: "DRAFT", label: "Draft" },
];

/** Shift type options for requisition template (matches Prisma ShiftType enum) */
export const REQUISITION_TEMPLATE_SHIFT_TYPE_OPTIONS = [
	{ value: "DAYS", label: "Days" },
	{ value: "EVENINGS", label: "Evening" },
	{ value: "NIGHTS", label: "Nights" },
	{ value: "ROTATING", label: "Rotating" },
	{ value: "WEEKENDS_ONLY", label: "Weekend Only" },
] as const;

/** Interview type options (matches Prisma InterviewType enum) */
export const REQUISITION_TEMPLATE_INTERVIEW_TYPE_OPTIONS = [
	{ value: "NO_INTERVIEW", label: "No Interview" },
	{ value: "CLIENT_INTERVIEW", label: "Client Interview" },
	{ value: "INTERNAL_INTERVIEW", label: "Internal Interview" },
] as const;
