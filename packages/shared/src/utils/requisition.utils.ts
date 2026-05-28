import { RequisitionStatus } from "../enums/requisition.enum";

export const REQUISITION_STATUS_LABEL: Record<RequisitionStatus, string> = {
	[RequisitionStatus.DRAFT]: "Draft",
	[RequisitionStatus.PENDING_APPROVAL]: "Pending Approval",
	[RequisitionStatus.SCHEDULED]: "Scheduled",
	[RequisitionStatus.PUBLISHED]: "Open",
	[RequisitionStatus.FILLED]: "Filled",
	[RequisitionStatus.CANCELLED]: "Cancelled",
};

export function getRequisitionStatusLabel(
	status: RequisitionStatus | `${RequisitionStatus}` | string,
): string {
	return (
		REQUISITION_STATUS_LABEL[status as RequisitionStatus] ?? String(status)
	);
}

/**
 * - PUBLISHED → success (green) — accepting submissions
 * - SCHEDULED → info (blue) — approved, awaits scheduled publish
 * - PENDING_APPROVAL → warning (amber) — awaiting org approval
 * - DRAFT → violet — author-only state
 * - FILLED → inactive (gray) — work complete
 * - CANCELLED → error (red) — closed early
 */
export type RequisitionStatusBadgeVariant =
	| "success"
	| "info"
	| "violet"
	| "inactive"
	| "error"
	| "warning";

export const REQUISITION_STATUS_VARIANT: Record<
	RequisitionStatus,
	RequisitionStatusBadgeVariant
> = {
	[RequisitionStatus.PUBLISHED]: "success",
	[RequisitionStatus.SCHEDULED]: "info",
	[RequisitionStatus.PENDING_APPROVAL]: "warning",
	[RequisitionStatus.DRAFT]: "violet",
	[RequisitionStatus.FILLED]: "inactive",
	[RequisitionStatus.CANCELLED]: "error",
};

export function getRequisitionStatusVariant(
	status: RequisitionStatus | `${RequisitionStatus}` | string,
): RequisitionStatusBadgeVariant {
	return REQUISITION_STATUS_VARIANT[status as RequisitionStatus] ?? "inactive";
}

export const REQUISITION_TERMINAL_STATUSES: ReadonlySet<RequisitionStatus> =
	new Set([RequisitionStatus.FILLED, RequisitionStatus.CANCELLED]);

export function isRequisitionTerminal(
	status: RequisitionStatus | `${RequisitionStatus}` | string,
): boolean {
	return REQUISITION_TERMINAL_STATUSES.has(status as RequisitionStatus);
}
