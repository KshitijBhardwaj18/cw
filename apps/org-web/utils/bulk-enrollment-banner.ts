import type { BulkEnrollmentStatus } from "@/stores/bulk-enrollment.store";

export type BulkEnrollmentAlertViewModel = {
	variant: "default" | "destructive";
	showSpinner: boolean;
	message: string;
};

export function getBulkEnrollmentAlertViewModel(
	status: BulkEnrollmentStatus,
): BulkEnrollmentAlertViewModel | null {
	if (status.phase === "idle") return null;
	if (status.phase === "processing") {
		return {
			variant: "default",
			showSpinner: true,
			message: "Processing bulk enrollment…",
		};
	}
	if (status.phase === "failed") {
		return {
			variant: "destructive",
			showSpinner: false,
			message: status.message,
		};
	}
	const errSuffix =
		status.errors && status.errors.length > 0
			? ` (${status.errors.length} error details)`
			: "";
	return {
		variant: "default",
		showSpinner: false,
		message: `Bulk enrollment complete. Enrolled: ${status.enrolled}, Skipped: ${status.skipped}, Failed: ${status.failed}${errSuffix}`,
	};
}

export function formatBulkEnrollmentCompleteToast(
	enrolled: number,
	skipped: number,
	failed: number,
): string {
	return `Bulk enrollment complete. Enrolled: ${enrolled}, skipped: ${skipped}, failed: ${failed}`;
}
