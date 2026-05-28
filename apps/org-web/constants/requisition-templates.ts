import { RequisitionType } from "@repo/shared";

export const REQUISITION_TEMPLATE_TYPE_OPTIONS = [
	{ value: RequisitionType.LONG_TERM_ORDER, label: "Long-Term Order" },
	{ value: RequisitionType.PER_DIEM, label: "Per Diem" },
	{ value: RequisitionType.PERMANENT_ROLE, label: "Permanent Role" },
	{ value: RequisitionType.INTERNAL_FLEX_POOL, label: "Internal Flex Pool" },
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

export { SHIFT_TYPE_OPTIONS as REQUISITION_TEMPLATE_SHIFT_TYPE_OPTIONS } from "@repo/shared";

/** Interview type options (matches Prisma InterviewType enum) */
export const REQUISITION_TEMPLATE_INTERVIEW_TYPE_OPTIONS = [
	{ value: "NO_INTERVIEW", label: "No Interview" },
	{ value: "CLIENT_INTERVIEW", label: "Client Interview" },
	{ value: "INTERNAL_INTERVIEW", label: "Internal Interview" },
] as const;
