"use client";

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
}: CredentialComplianceActionDialogProps) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const uploadForm = useForm({
		defaultValues: {
			itemId: item?.id ?? "",
			file: null as File | null,
			expirationDate: item?.expirationDate ?? "",
		},
		onSubmit: async ({ value }) => {
			const parsed = credentialUploadDocumentFormSchema.safeParse(value);
			if (!parsed.success) {
				uploadForm.validate("submit");
				return;
			}
			onSubmitUpload({
				itemId: parsed.data.itemId,
				file: parsed.data.file,
				expirationDate: parsed.data.expirationDate || undefined,
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
		});
		setSelectedFile(null);
	}, [item, open, uploadForm]);

	if (!item) return null;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-md">
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
						<FieldLabel>File Upload</FieldLabel>
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

					<uploadForm.Field name="expirationDate">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>
									Expiration Date (Optional)
								</FieldLabel>
								<DatePicker
									id={field.name}
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									onBlur={field.handleBlur}
									placeholder="Pick an expiration date"
								/>
							</Field>
						)}
					</uploadForm.Field>

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
