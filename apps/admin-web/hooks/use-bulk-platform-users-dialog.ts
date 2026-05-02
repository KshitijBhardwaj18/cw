"use client";

import {
	BULK_CSV_ACCEPTED_TYPES,
	BULK_ENROLLMENT_FILE_MAX_MB,
	validateBulkEnrollmentCsv,
} from "@repo/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { UsersService } from "@/services/users.service";

export function useBulkPlatformUsersDialog(
	open: boolean,
	onOpenChange: (open: boolean) => void,
	onJobStarted?: (jobId: string) => void,
) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [fileError, setFileError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const setFile = useCallback((file: File | null) => {
		setSelectedFile(file);
		setFileError(file ? validateBulkEnrollmentCsv(file, "File") : null);
	}, []);

	useEffect(() => {
		if (!open) {
			setSelectedFile(null);
			setFileError(null);
			setIsDragging(false);
			setIsSubmitting(false);
		}
	}, [open]);

	const handleDownloadTemplate = useCallback(() => {
		const headers = [
			"First Name",
			"Last Name",
			"Job Title",
			"Email",
			"Office Phone",
			"Mobile Phone",
			"Role",
			"Status",
		];
		const example = [
			"Jane",
			"Doe",
			"Operations Lead",
			"jane.doe@example.com",
			"+1 555 0100",
			"+1 555 0101",
			"GENERAL_ADMIN",
			"ACTIVE",
		];
		const csv = [headers.join(","), example.join(",")].join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "platform-users-import-template.csv";
		a.click();
		URL.revokeObjectURL(url);
	}, []);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) setFile(file);
			e.target.value = "";
		},
		[setFile],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			const file = e.dataTransfer.files?.[0];
			if (file) setFile(file);
		},
		[setFile],
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleZoneClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!selectedFile || fileError) return;
		setIsSubmitting(true);
		try {
			const { jobId } =
				await UsersService.submitBulkPlatformUsers(selectedFile);
			toast.success("Import started");
			onJobStarted?.(jobId);
			setSelectedFile(null);
			setFileError(null);
			onOpenChange(false);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to submit import";
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	}, [selectedFile, fileError, onJobStarted, onOpenChange]);

	const handleOpenChange = useCallback(
		(next: boolean) => {
			if (!next) {
				setSelectedFile(null);
				setFileError(null);
				setIsDragging(false);
				setIsSubmitting(false);
			}
			onOpenChange(next);
		},
		[onOpenChange],
	);

	return {
		fileInputRef,
		selectedFile,
		isDragging,
		fileError,
		isSubmitting,
		handleDownloadTemplate,
		handleFileChange,
		handleDrop,
		handleDragOver,
		handleDragLeave,
		handleZoneClick,
		handleSubmit,
		handleOpenChange,
		ACCEPTED_TYPES: BULK_CSV_ACCEPTED_TYPES,
		MAX_SIZE_MB: BULK_ENROLLMENT_FILE_MAX_MB,
	};
}
