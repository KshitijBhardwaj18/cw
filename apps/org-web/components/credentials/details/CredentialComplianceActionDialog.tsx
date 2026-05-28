"use client";

import {
	ComplianceListItemExpirationType,
	formatExpiryFromRule,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { useForm } from "@tanstack/react-form";
import { FileText, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { credentialUploadDocumentFormSchema } from "@/schemas/credential-entry-details.schema";
import type {
	CredentialComplianceItem,
	CredentialEntryUploadDocumentPayload,
} from "@/types/credential-entry-details";

interface CredentialComplianceActionDialogProps {
	open: boolean;
	item: CredentialComplianceItem | null;
	isUploading?: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmitUpload: (payload: CredentialEntryUploadDocumentPayload) => void;
}

export function CredentialComplianceActionDialog({
	open,
	item,
	isUploading = false,
	onOpenChange,
	onSubmitUpload,
}: Readonly<CredentialComplianceActionDialogProps>) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const uploadForm = useForm({
		defaultValues: {
			itemId: item?.id ?? "",
			file: null as File | null,
			expirationDate: item?.expirationDate ?? "",
			issueDate: "",
		},
		onSubmit: async ({ value }) => {
			const parsed = credentialUploadDocumentFormSchema.safeParse(value);
			if (!parsed.success) {
				uploadForm.validate("submit");
				return;
			}
			if (!item) return;
			if (
				item.expirationType ===
					ComplianceListItemExpirationType.EXPIRATION_RULE &&
				!value.issueDate.trim()
			) {
				return;
			}
			if (
				item.expirationType ===
					ComplianceListItemExpirationType.EXPIRATION_DATE &&
				!value.expirationDate.trim()
			) {
				return;
			}
			onSubmitUpload({
				itemId: parsed.data.itemId,
				file: parsed.data.file,
				expirationDate:
					item.expirationType ===
					ComplianceListItemExpirationType.EXPIRATION_DATE
						? parsed.data.expirationDate || undefined
						: undefined,
				issueDate:
					item.expirationType ===
					ComplianceListItemExpirationType.EXPIRATION_RULE
						? parsed.data.issueDate || undefined
						: undefined,
			});
			onOpenChange(false);
		},
	});

	const handleFileClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null;
		setSelectedFile(file);
		uploadForm.setFieldValue("file", file);
	};

	const handleOpenChange = (next: boolean) => {
		if (!next) {
			uploadForm.reset();
			setSelectedFile(null);
		}
		onOpenChange(next);
	};

	useEffect(() => {
		if (!item || !open) return;

		uploadForm.reset({
			itemId: item.id,
			file: null,
			expirationDate: item.expirationDate ?? "",
			issueDate: "",
		});
		setSelectedFile(null);
	}, [item, open, uploadForm]);

	if (!item) return null;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] max-w-md overflow-y-auto">
				<input
					ref={fileInputRef}
					type="file"
					accept=".pdf,application/pdf"
					className="hidden"
					onChange={handleFileChange}
				/>
				<DialogHeader>
					<DialogTitle>Upload Document</DialogTitle>
					<DialogDescription>{item.name}</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void uploadForm.handleSubmit();
					}}
					className="space-y-4"
				>
					<Field>
						<FieldLabel>
							File Upload <RequiredStar />
						</FieldLabel>
						{selectedFile ? (
							<div className="rounded-md border px-3 py-2">
								<div className="flex items-center justify-between gap-2">
									<div className="flex min-w-0 items-center gap-2">
										<FileText className="size-4 shrink-0" />
										<span className="truncate text-sm font-medium">
											{selectedFile.name}
										</span>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={handleFileClick}
									>
										Replace
									</Button>
								</div>
							</div>
						) : (
							<>
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={handleFileClick}
								>
									<Upload className="size-4" data-icon="inline-start" />
									Upload File (PDF)
								</Button>
								{uploadForm.state.submissionAttempts > 0 && !selectedFile && (
									<FieldError>File upload is required</FieldError>
								)}
							</>
						)}
					</Field>

					{item.expirationType ===
						ComplianceListItemExpirationType.EXPIRATION_RULE && (
						<uploadForm.Field name="issueDate">
							{(field) => {
								const computedExpiry = formatExpiryFromRule(
									field.state.value,
									item.expirationRuleValue,
									item.expirationRuleUnit,
								);
								return (
									<Field>
										<FieldLabel htmlFor={field.name}>
											Issue Date <RequiredStar />
										</FieldLabel>
										<DatePicker
											id={field.name}
											value={field.state.value}
											onChange={(value) => field.handleChange(value)}
											onBlur={field.handleBlur}
											placeholder="Pick the issue date"
										/>
										{uploadForm.state.submissionAttempts > 0 &&
											!field.state.value.trim() && (
												<FieldError>Issue date is required</FieldError>
											)}
										{computedExpiry && (
											<p className="text-muted-foreground mt-1 text-xs">
												Expires automatically on{" "}
												<span className="font-medium">{computedExpiry}</span> (
												{item.expirationRuleValue}{" "}
												{item.expirationRuleUnit?.toLowerCase()} from issue
												date)
											</p>
										)}
									</Field>
								);
							}}
						</uploadForm.Field>
					)}

					{item.expirationType ===
						ComplianceListItemExpirationType.EXPIRATION_DATE && (
						<uploadForm.Field name="expirationDate">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>
										Expiration Date <RequiredStar />
									</FieldLabel>
									<DatePicker
										id={field.name}
										value={field.state.value}
										onChange={(value) => field.handleChange(value)}
										onBlur={field.handleBlur}
										placeholder="Pick an expiration date"
									/>
									{uploadForm.state.submissionAttempts > 0 &&
										!field.state.value.trim() && (
											<FieldError>Expiration date is required</FieldError>
										)}
								</Field>
							)}
						</uploadForm.Field>
					)}

					<DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
						<Button
							type="button"
							variant="outline"
							disabled={isUploading}
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isUploading}>
							{isUploading ? "Uploading…" : "Save Document"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
