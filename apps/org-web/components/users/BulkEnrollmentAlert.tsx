"use client";

import { BulkJobAlert } from "@repo/ui/general/BulkJobAlert";
import type { BulkEnrollmentStatus } from "@/stores/bulk-enrollment.store";
import { toBulkEnrollmentAlertStatus } from "@/utils/bulk-enrollment-banner";

type BulkEnrollmentAlertProps = {
	status: BulkEnrollmentStatus;
	onDismiss: () => void;
};

export function BulkEnrollmentAlert({
	status,
	onDismiss,
}: Readonly<BulkEnrollmentAlertProps>) {
	return (
		<BulkJobAlert
			status={toBulkEnrollmentAlertStatus(status)}
			onDismiss={onDismiss}
			errorsTitle="Bulk enrollment errors"
		/>
	);
}
