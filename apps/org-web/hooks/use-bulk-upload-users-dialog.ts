"use client";

import {
	BULK_ENROLLMENT_FILE_MAX_MB,
	validateBulkEnrollmentCsv,
} from "@repo/shared";
import { useCallback, useEffect, useState } from "react";
import { downloadOrganizationEnrollmentTemplate } from "@/utils/download-organization-enrollment-template";

export function useBulkUploadUsersDialog(open: boolean) {
	const [file, setFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);

	const syncFile = useCallback((f: File | null) => {
		setFile(f);
		setFileError(f ? validateBulkEnrollmentCsv(f, "File") : null);
	}, []);

	useEffect(() => {
		if (!open) {
			setFile(null);
			setFileError(null);
		}
	}, [open]);

	const downloadTemplate = useCallback(() => {
		downloadOrganizationEnrollmentTemplate();
	}, []);

	const reset = useCallback(() => {
		syncFile(null);
	}, [syncFile]);

	return {
		file,
		fileError,
		syncFile,
		downloadTemplate,
		reset,
		maxSizeMb: BULK_ENROLLMENT_FILE_MAX_MB,
	};
}
