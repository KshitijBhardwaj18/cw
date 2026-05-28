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
import { Field, FieldContent, FieldLabel } from "@repo/ui/components/field";
import { DNDDocumentUpload } from "@repo/ui/general/DNDDocumentUpload";
import RequiredStar from "@repo/ui/general/RequiredStar";
import type { UseMutationResult } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
	CandidateDocumentWalletItem,
	CandidateDocumentWalletUploadVars,
} from "@/types/candidate-document-wallet";

export interface DocumentWalletUploadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: CandidateDocumentWalletItem | null;
	uploadMutation: Pick<
		UseMutationResult<unknown, Error, CandidateDocumentWalletUploadVars>,
		"mutate" | "isPending"
	>;
}

export function DocumentWalletUploadDialog({
	open,
	onOpenChange,
	item,
	uploadMutation,
}: Readonly<DocumentWalletUploadDialogProps>) {
	const [files, setFiles] = useState<File[]>([]);
	const [expiryDate, setExpiryDate] = useState("");
	const [issueDate, setIssueDate] = useState("");

	useEffect(() => {
		if (!open) return;
		setFiles([]);
		setExpiryDate("");
		setIssueDate("");
	}, [open]);

	const computedExpiry = useMemo(() => {
		if (
			!item ||
			item.expirationType !== ComplianceListItemExpirationType.EXPIRATION_RULE
		)
			return null;
		return formatExpiryFromRule(
			issueDate,
			item.expirationRuleValue,
			item.expirationRuleUnit,
		);
	}, [issueDate, item]);

	const hasRequiredDate =
		!item ||
		item.expirationType === ComplianceListItemExpirationType.NON_EXPIRABLE ||
		(item.expirationType === ComplianceListItemExpirationType.EXPIRATION_RULE &&
			!!issueDate.trim()) ||
		(item.expirationType === ComplianceListItemExpirationType.EXPIRATION_DATE &&
			!!expiryDate.trim());

	const canSubmit =
		!!item && files.length > 0 && hasRequiredDate && !uploadMutation.isPending;

	const handleSubmit = () => {
		if (!canSubmit || !files[0] || !item) return;
		uploadMutation.mutate(
			{
				complianceListItemId: item.complianceListItemId,
				file: files[0],
				expiryDate:
					item.expirationType ===
					ComplianceListItemExpirationType.EXPIRATION_DATE
						? expiryDate.trim() || undefined
						: undefined,
				issueDate:
					item.expirationType ===
					ComplianceListItemExpirationType.EXPIRATION_RULE
						? issueDate.trim() || undefined
						: undefined,
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
						{item?.title ?? "Upload your compliance document for review."}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 pt-2">
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

					{item?.expirationType ===
						ComplianceListItemExpirationType.EXPIRATION_RULE && (
						<Field>
							<FieldLabel>
								Issue Date <RequiredStar />
							</FieldLabel>
							<FieldContent>
								<DatePicker
									value={issueDate}
									onChange={setIssueDate}
									placeholder="Select issue date"
									clearable
								/>
								{computedExpiry && (
									<p className="text-muted-foreground mt-1 text-xs">
										Expires automatically on{" "}
										<span className="font-medium">{computedExpiry}</span> (
										{item.expirationRuleValue}{" "}
										{item.expirationRuleUnit?.toLowerCase()} from issue date)
									</p>
								)}
							</FieldContent>
						</Field>
					)}

					{item?.expirationType ===
						ComplianceListItemExpirationType.EXPIRATION_DATE && (
						<Field>
							<FieldLabel>
								Expiration Date <RequiredStar />
							</FieldLabel>
							<FieldContent>
								<DatePicker
									value={expiryDate}
									onChange={setExpiryDate}
									placeholder="Select expiration date"
									clearable
								/>
							</FieldContent>
						</Field>
					)}
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
