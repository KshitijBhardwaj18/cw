"use client";

import {
	ComplianceListItemCategory,
	ComplianceListItemResponseStyle,
	type ComplianceResponseType,
	type ExpirationRuleUnit,
	validatePdfDocument,
} from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	useComplianceFileSignedUrl,
	useCreateComplianceItem,
	useUpdateComplianceItem,
} from "@/queries/compliance.query";
import {
	ComplianceFormSchema,
	type ComplianceFormValues,
} from "@/schemas/compliance.schema";

const FILE_PLACEHOLDER = "__file_provided__";

function getComplianceDefaultValues(
	item?: ComplianceResponseType,
	defaultCategory?: ComplianceListItemCategory,
): ComplianceFormValues {
	return {
		name: item?.name ?? "",
		category: (item?.category ??
			defaultCategory ??
			ComplianceListItemCategory.BACKGROUND_AND_IDENTIFICATION) as ComplianceListItemCategory,
		expirationType: (item?.expirationType ??
			"EXPIRATION_DATE") as ComplianceFormValues["expirationType"],
		expirationRuleValue: item?.expirationRuleValue ?? null,
		expirationRuleUnit: (item?.expirationRuleUnit ??
			null) as ExpirationRuleUnit | null,
		issuerRequirement: item?.issuerRequirement ?? false,
		issuer: item?.issuer ?? null,
		responseStyle: (item?.responseStyle ??
			ComplianceListItemResponseStyle.PENDING_FILE_UPLOAD) as ComplianceListItemResponseStyle,
		file: item?.file ?? null,
		instructionalNotes: item?.instructionalNotes ?? null,
		displayToCandidate: item?.displayToCandidate ?? false,
		status: (item?.status ?? "ACTIVE") as ComplianceFormValues["status"],
	};
}

function isStoredFileLink(file: string | null | undefined): boolean {
	return !!file?.trim() && file.startsWith("http");
}

export type UseComplianceFormDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item?: ComplianceResponseType;
};

export function useComplianceFormDialog({
	open,
	onOpenChange,
	item,
}: UseComplianceFormDialogProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [complianceFile, setComplianceFile] = useState<File | null>(null);
	const [complianceFileUploadDate, setComplianceFileUploadDate] = useState<
		string | null
	>(null);
	const [isReplacingStoredFile, setIsReplacingStoredFile] = useState(false);

	const createMutation = useCreateComplianceItem();
	const updateMutation = useUpdateComplianceItem();
	const signedUrlMutation = useComplianceFileSignedUrl();
	const isEdit = !!item;

	const form = useForm({
		defaultValues: getComplianceDefaultValues(item),
		validators: { onSubmit: ComplianceFormSchema },
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: ({ value }) => {
			const hasFileUpload = !!complianceFile;
			const hasLink = !!value.file?.trim() && value.file !== FILE_PLACEHOLDER;

			const requiresFile =
				value.responseStyle ===
					ComplianceListItemResponseStyle.DOWNLOAD_AND_UPLOAD ||
				value.responseStyle === ComplianceListItemResponseStyle.LINK;

			if (requiresFile && !hasFileUpload && !hasLink) {
				toast.error("Upload a file or provide a link URL");
				return;
			}

			const payload: Record<string, unknown> = { ...value };
			if (hasFileUpload) {
				delete payload.file;
			} else if (hasLink && value.file !== FILE_PLACEHOLDER) {
				payload.file = value.file;
			}

			const formData = new FormData();
			formData.append("data", JSON.stringify(payload));
			if (hasFileUpload) {
				formData.append("complianceDocument", complianceFile);
			}
			const mutationOptions = {
				onSuccess: () => {
					const msg = isEdit ? "updated" : "created";
					toast.success(`Compliance item ${msg} successfully`);
					handleClose();
				},
				onError: (err: unknown) => {
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					);
				},
			};
			if (isEdit && item) {
				updateMutation.mutate({ id: item.id, formData }, mutationOptions);
			} else {
				createMutation.mutate(formData, mutationOptions);
			}
		},
	});

	const handleClose = () => {
		form.reset(getComplianceDefaultValues(undefined));
		setComplianceFile(null);
		setComplianceFileUploadDate(null);
		setIsReplacingStoredFile(false);
		onOpenChange(false);
	};

	useEffect(() => {
		if (!open) return;
		form.reset(getComplianceDefaultValues(item));
		setComplianceFile(null);
		setComplianceFileUploadDate(null);
		setIsReplacingStoredFile(false);
	}, [open, item, form]);

	const isPending = createMutation.isPending || updateMutation.isPending;

	const handleOpenChange = (nextOpen: boolean) => {
		if (isPending) return;
		if (!nextOpen) handleClose();
		else onOpenChange(nextOpen);
	};

	const handleFileClick = () => fileInputRef.current?.click();
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const err = validatePdfDocument(file, "Compliance document");
		if (err) {
			toast.error(err);
			return;
		}
		setComplianceFile(file);
		form.setFieldValue("file", FILE_PLACEHOLDER);
		setComplianceFileUploadDate(new Date().toLocaleDateString("en-US"));
		e.target.value = "";
	};

	const handleFileDownload = () => {
		if (complianceFile) {
			const url = URL.createObjectURL(complianceFile);
			const a = document.createElement("a");
			a.href = url;
			a.download = complianceFile.name;
			a.target = "_blank";
			a.click();
			URL.revokeObjectURL(url);
			return;
		}
		if (!item?.id) {
			toast.error("No document to download");
			return;
		}
		signedUrlMutation.mutate(item.id, {
			onSuccess: ({ signedUrl }) => {
				const a = document.createElement("a");
				a.href = signedUrl;
				a.download = "compliance-document.pdf";
				a.target = "_blank";
				a.click();
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to get document",
				);
			},
		});
	};

	const handleFileView = () => {
		if (complianceFile) {
			window.open(URL.createObjectURL(complianceFile), "_blank");
			return;
		}
		if (!item?.id) {
			toast.error("No document to view");
			return;
		}
		signedUrlMutation.mutate(item.id, {
			onSuccess: ({ signedUrl }) => {
				window.open(signedUrl, "_blank");
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Failed to get document",
				);
			},
		});
	};

	const handleFileReplace = () => {
		setComplianceFile(null);
		setComplianceFileUploadDate(null);
		setIsReplacingStoredFile(true);
		form.setFieldValue("file", null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const clearFileOnResponseStyleChange = () => {
		setComplianceFile(null);
		setComplianceFileUploadDate(null);
		setIsReplacingStoredFile(false);
		form.setFieldValue("file", null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const hasStoredFile =
		item?.file && !isStoredFileLink(item.file) && !isReplacingStoredFile;
	const hasFile = complianceFile || hasStoredFile;

	return {
		form,
		fileInputRef,
		complianceFile,
		complianceFileUploadDate,
		hasStoredFile,
		hasFile,
		isPending,
		isEdit,
		signedUrlMutation,
		handleOpenChange,
		handleFileClick,
		handleFileChange,
		handleFileDownload,
		handleFileView,
		handleFileReplace,
		clearFileOnResponseStyleChange,
		getComplianceDefaultValues,
	};
}
