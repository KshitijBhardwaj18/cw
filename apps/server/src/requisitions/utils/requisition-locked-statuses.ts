import { RequisitionStatus } from "@repo/db";

/**
 * Statuses where a requisition has reached a terminal lifecycle state and
 * should NOT accept any new submission activity (new offers, acceptances).
 * - FILLED: capacity met; opening more offers would oversubscribe.
 * - CANCELLED: requisition is no longer active.
 *
 * Submission *creation* is already blocked separately because both create
 * paths require `status === PUBLISHED`. This guard exists for in-flight
 * submissions that would otherwise progress to OFFERED / ACCEPTED.
 */
const LOCKED_FOR_NEW_ACTIVITY: ReadonlySet<RequisitionStatus> = new Set([
	RequisitionStatus.FILLED,
	RequisitionStatus.CANCELLED,
]);

export function isRequisitionLockedForNewActivity(
	status: RequisitionStatus,
): boolean {
	return LOCKED_FOR_NEW_ACTIVITY.has(status);
}

export function requisitionLockedReason(status: RequisitionStatus): string {
	switch (status) {
		case RequisitionStatus.FILLED:
			return "This requisition is filled; no further offers or acceptances can be made.";
		case RequisitionStatus.CANCELLED:
			return "This requisition has been cancelled; no further activity is allowed.";
		default:
			return "This requisition is no longer accepting activity.";
	}
}
