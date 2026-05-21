"use client";

import { getComplianceListItemCategoryLabel } from "@repo/shared";
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
import { Field, FieldContent, FieldLabel } from "@repo/ui/components/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { DNDDocumentUpload } from "@repo/ui/general/DNDDocumentUpload";
import RequiredStar from "@repo/ui/general/RequiredStar";
import type { UseMutationResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	DOCUMENT_WALLET_CATEGORIES_CANDIDATE,
	type DocumentCategoryId,
	type DocumentWalletCategory,
} from "@/components/document-wallet/mock-document-wallet";
import type {
	CandidateDocumentWalletPickerItem,
	CandidateDocumentWalletUploadVars,
} from "@/types/candidate-document-wallet";

export type DocumentWalletUploadDialogProps =
	| DocumentWalletUploadDialogApiProps
	| DocumentWalletUploadDialogMockProps;

type DocumentWalletUploadDialogApiProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	pickerItems: CandidateDocumentWalletPickerItem[];
	defaultComplianceListItemId?: string;
	uploadMutation: Pick<
		UseMutationResult<
			{ success: true },
			Error,
			CandidateDocumentWalletUploadVars
		>,
		"mutate" | "isPending"
	>;
};

type DocumentWalletUploadDialogMockProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultCategoryId?: DocumentCategoryId;
	/** Mock category list for the select (defaults to candidate mock categories). */
	mockCategories?: DocumentWalletCategory[];
};

export function DocumentWalletUploadDialog(
	props: DocumentWalletUploadDialogProps,
) {
	if ("uploadMutation" in props) {
		return <DocumentWalletUploadDialogApi {...props} />;
	}
	return <DocumentWalletUploadDialogMock {...props} />;
}

function DocumentWalletUploadDialogApi({
	open,
	onOpenChange,
	pickerItems,
	defaultComplianceListItemId,
	uploadMutation,
}: DocumentWalletUploadDialogApiProps) {
	const [complianceListItemId, setComplianceListItemId] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [expiryDate, setExpiryDate] = useState("");

	useEffect(() => {
		if (!open) return;
		setComplianceListItemId(defaultComplianceListItemId ?? "");
		setFiles([]);
		setExpiryDate("");
	}, [open, defaultComplianceListItemId]);

	const canSubmit =
		complianceListItemId !== "" &&
		files.length > 0 &&
		!uploadMutation.isPending;

	const handleSubmit = () => {
		if (!canSubmit || !files[0]) return;
		uploadMutation.mutate(
			{
				complianceListItemId,
				file: files[0],
				expiryDate: expiryDate.trim() || undefined,
			},
			{
				onSuccess: () => {
					toast.success("Document uploaded");
					onOpenChange(false);
				},
				onError: (e) => {
					toast.error(e instanceof Error ? e.message : "Upload failed");
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Upload Document</DialogTitle>
					<DialogDescription>
						Upload your compliance document for review.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 pt-2">
					<Field>
						<FieldLabel>
							Requirement <RequiredStar />
						</FieldLabel>
						<FieldContent>
							{pickerItems.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									No items need a new upload right now.
								</p>
							) : (
								<Select
									value={complianceListItemId || undefined}
									onValueChange={setComplianceListItemId}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select requirement…" />
									</SelectTrigger>
									<SelectContent>
										{pickerItems.map((p) => (
											<SelectItem
												key={p.complianceListItemId}
												value={p.complianceListItemId}
											>
												{getComplianceListItemCategoryLabel(p.categoryKey)} —{" "}
												{p.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</FieldContent>
					</Field>

					<Field>
						<FieldLabel>
							Upload File <RequiredStar />
						</FieldLabel>
						<FieldContent>
							<DNDDocumentUpload
								files={files}
								onFilesChange={setFiles}
								maxFiles={1}
								maxSize={10}
								allowedTypes={["pdf", "jpg", "png"]}
								hint="PDF, JPG, PNG (Max 10MB)"
							/>
						</FieldContent>
					</Field>

					<Field>
						<FieldLabel>Expiry Date (Optional)</FieldLabel>
						<FieldContent>
							<DatePicker
								value={expiryDate}
								onChange={setExpiryDate}
								placeholder="Select expiry date"
								clearable
							/>
						</FieldContent>
					</Field>
				</div>

				<DialogFooter className="gap-2 sm:justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
						{uploadMutation.isPending ? "Uploading…" : "Upload Document"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function DocumentWalletUploadDialogMock({
	open,
	onOpenChange,
	defaultCategoryId,
	mockCategories = DOCUMENT_WALLET_CATEGORIES_CANDIDATE,
}: DocumentWalletUploadDialogMockProps) {
	const [categoryId, setCategoryId] = useState<DocumentCategoryId | "">("");
	const [files, setFiles] = useState<File[]>([]);
	const [expiryDate, setExpiryDate] = useState("");

	useEffect(() => {
		if (!open) return;
		setCategoryId(defaultCategoryId ?? "");
		setFiles([]);
		setExpiryDate("");
	}, [open, defaultCategoryId]);

	const canSubmit = categoryId !== "" && files.length > 0;

	const handleSubmit = () => {
		if (!canSubmit) return;
		toast.success("Document upload is mocked — no file was sent.");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Upload Document</DialogTitle>
					<DialogDescription>
						Upload your compliance document for review.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 pt-2">
					<Field>
						<FieldLabel>
							Document Category <RequiredStar />
						</FieldLabel>
						<FieldContent>
							<Select
								value={categoryId || undefined}
								onValueChange={(v) => setCategoryId(v as DocumentCategoryId)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select category..." />
								</SelectTrigger>
								<SelectContent>
									{mockCategories.map((cat) => (
										<SelectItem key={cat.id} value={cat.id}>
											{cat.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FieldContent>
					</Field>

					<Field>
						<FieldLabel>
							Upload File <RequiredStar />
						</FieldLabel>
						<FieldContent>
							<DNDDocumentUpload
								files={files}
								onFilesChange={setFiles}
								maxFiles={1}
								maxSize={10}
								allowedTypes={["pdf", "jpg", "png"]}
								hint="PDF, JPG, PNG (Max 10MB)"
							/>
						</FieldContent>
					</Field>

					<Field>
						<FieldLabel>Expiry Date (Optional)</FieldLabel>
						<FieldContent>
							<DatePicker
								value={expiryDate}
								onChange={setExpiryDate}
								placeholder="Select expiry date"
								clearable
							/>
						</FieldContent>
					</Field>
				</div>

				<DialogFooter className="gap-2 sm:justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
						Upload Document
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
