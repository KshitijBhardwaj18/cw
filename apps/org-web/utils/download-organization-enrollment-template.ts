"use client";

import {
	buildOrganizationBulkEnrollmentTemplateCsv,
	ORGANIZATION_BULK_ENROLLMENT_TEMPLATE_FILENAME,
} from "@repo/shared";

export function downloadOrganizationEnrollmentTemplate(): void {
	const csv = buildOrganizationBulkEnrollmentTemplateCsv();
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = ORGANIZATION_BULK_ENROLLMENT_TEMPLATE_FILENAME;
	a.click();
	URL.revokeObjectURL(url);
}
