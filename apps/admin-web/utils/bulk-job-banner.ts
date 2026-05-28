import type { BulkJobAlertStatus } from "@repo/ui/general/BulkJobAlert";
import type { BulkEnrollmentStatus } from "@/stores/bulk-enrollment.store";
import type { BulkPlatformUsersStatus } from "@/stores/bulk-platform-users.store";

export function toBulkEnrollmentAlertStatus(
	status: BulkEnrollmentStatus,
): BulkJobAlertStatus {
	if (status.phase === "idle") return { phase: "idle" };
	if (status.phase === "processing") {
		return {
			phase: "processing",
			processingLabel: "Processing bulk enrollment…",
		};
	}
	if (status.phase === "failed") {
		return { phase: "failed", message: status.message };
	}
	return {
		phase: "completed",
		summary: `Bulk enrollment complete. Enrolled: ${status.enrolled}, Skipped: ${status.skipped}, Failed: ${status.failed}`,
		errors: status.errors,
	};
}

export function toBulkPlatformUsersAlertStatus(
	status: BulkPlatformUsersStatus,
): BulkJobAlertStatus {
	if (status.phase === "idle") return { phase: "idle" };
	if (status.phase === "processing") {
		return { phase: "processing", processingLabel: "Processing bulk import…" };
	}
	if (status.phase === "failed") {
		return { phase: "failed", message: status.message };
	}
	return {
		phase: "completed",
		summary: `Bulk import complete. Created: ${status.created}, Skipped: ${status.skipped}, Failed: ${status.failed}`,
		errors: status.errors,
	};
}
