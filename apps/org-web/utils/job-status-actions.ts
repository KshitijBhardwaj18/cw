import { isRequisitionTerminal, RequisitionStatus } from "@repo/shared";

export function isJobActionLocked(status: string | null | undefined): boolean {
	return status != null && isRequisitionTerminal(status);
}

export function jobActionLockedReason(
	status: string | null | undefined,
): string {
	switch (status) {
		case RequisitionStatus.FILLED:
			return "This job is filled and can no longer be edited or closed.";
		case RequisitionStatus.CANCELLED:
			return "This job has been cancelled.";
		default:
			return "";
	}
}
