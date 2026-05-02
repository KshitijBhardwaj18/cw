"use client";

import { formatDate } from "@repo/shared";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import {
	AlertTriangle,
	Check,
	CircleX,
	Clock,
	Download,
	Eye,
	FileText,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import type { DocumentWalletRequirement } from "@/components/document-wallet/mock-document-wallet";
import type { CandidateDocumentWalletItem } from "@/types/candidate-document-wallet";

export type DocumentRequirementAudience = "candidate" | "vendor";

export type DocumentRequirementCardProps =
	| DocumentRequirementCardMockProps
	| DocumentRequirementCardApiProps;

type DocumentRequirementCardMockProps = {
	requirement: DocumentWalletRequirement;
	audience?: DocumentRequirementAudience;
	onUploadClick: () => void;
	onReplaceClick: () => void;
	onDownloadClick?: () => void;
	onViewClick?: () => void;
	onApproveClick?: () => void;
	onRejectClick?: () => void;
	onDeleteClick?: () => void;
};

type DocumentRequirementCardApiProps = {
	requirement: CandidateDocumentWalletItem;
	onUploadClick: () => void;
	onReplaceClick: () => void;
	onDownloadClick?: () => void;
	onViewClick?: () => void;
	audience?: DocumentRequirementAudience;
	onApproveClick?: () => void;
	onRejectClick?: () => void;
	isReviewActionPending?: boolean;
};

export function DocumentRequirementCard(props: DocumentRequirementCardProps) {
	if ("complianceListItemId" in props.requirement) {
		return (
			<DocumentRequirementCardApi
				{...(props as DocumentRequirementCardApiProps)}
			/>
		);
	}
	return (
		<DocumentRequirementCardMock
			{...(props as DocumentRequirementCardMockProps)}
		/>
	);
}

function DocumentRequirementCardApi({
	requirement,
	onUploadClick,
	onReplaceClick,
	onDownloadClick,
	onViewClick,
	audience = "candidate",
	onApproveClick,
	onRejectClick,
	isReviewActionPending,
}: DocumentRequirementCardApiProps) {
	const {
		title,
		description,
		status,
		uploadedAt,
		expiresAt,
		documentFileName,
	} = requirement;

	const isVendor = audience === "vendor";

	const uploadedLabel = uploadedAt ? formatDate(uploadedAt) : undefined;
	const expiresLabel = expiresAt ? formatDate(expiresAt) : undefined;

	const showFileMeta =
		status === "approved" ||
		status === "pending_verification" ||
		(status === "expired" && uploadedLabel);

	return (
		<Card className="overflow-hidden border shadow-sm">
			<CardHeader className="space-y-3 pb-3">
				<div className="flex gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted/60">
						<FileText className="size-5 text-muted-foreground" aria-hidden />
					</div>
					<div className="min-w-0 flex-1 space-y-1">
						<div className="flex items-start justify-between gap-2">
							<div>
								<p className="font-semibold leading-tight text-foreground">
									{title}
								</p>
								<p className="text-sm text-muted-foreground">{description}</p>
								{documentFileName && (
									<p className="text-muted-foreground mt-1 truncate text-xs">
										{documentFileName}
									</p>
								)}
							</div>
							{(status === "approved" || status === "pending_verification") && (
								<button
									type="button"
									className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
									aria-label="Download"
									onClick={onDownloadClick}
								>
									<Download className="size-4" />
								</button>
							)}
						</div>
						<StatusRowApi status={status} />
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-3 border-t pt-4">
				{showFileMeta && uploadedLabel && (
					<div className="space-y-2 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Clock className="size-4 shrink-0" aria-hidden />
							<span>Uploaded: {uploadedLabel}</span>
						</div>
						{expiresLabel && (
							<div
								className={cn(
									"flex items-center gap-2",
									status === "expired" && "text-destructive",
								)}
							>
								<AlertTriangle className="size-4 shrink-0" aria-hidden />
								<span>Expires: {expiresLabel}</span>
							</div>
						)}
					</div>
				)}

				{(status === "pending_upload" ||
					(status === "expired" && !uploadedLabel)) && (
					<p className="flex min-h-16 items-center justify-center text-center text-sm text-muted-foreground">
						No document uploaded yet
					</p>
				)}
			</CardContent>

			<CardFooter className="flex flex-col gap-2 border-t bg-muted/20 pt-4 pb-4">
				{status === "pending_upload" && !isVendor && (
					<Button type="button" className="w-full" onClick={onUploadClick}>
						<Upload className="size-4" aria-hidden />
						Upload Document
					</Button>
				)}

				{status === "pending_upload" && isVendor && (
					<p className="text-center text-sm text-muted-foreground">
						The candidate uploads documents from their portal.
					</p>
				)}

				{status === "approved" && (
					<div className="grid w-full grid-cols-2 gap-2">
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={onViewClick}
						>
							<Eye className="size-4" aria-hidden />
							View
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={onDownloadClick}
						>
							<Download className="size-4" aria-hidden />
							Download
						</Button>
					</div>
				)}

				{status === "expired" && uploadedLabel && !isVendor && (
					<div className="flex w-full flex-col gap-2">
						<div className="grid grid-cols-2 gap-2">
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={onViewClick}
							>
								<Eye className="size-4" aria-hidden />
								View
							</Button>
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={onDownloadClick}
							>
								<Download className="size-4" aria-hidden />
								Download
							</Button>
						</div>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={onReplaceClick}
						>
							<Upload className="size-4" aria-hidden />
							Replace
						</Button>
					</div>
				)}

				{status === "expired" && uploadedLabel && isVendor && (
					<div className="grid w-full grid-cols-2 gap-2">
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={onViewClick}
						>
							<Eye className="size-4" aria-hidden />
							View
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={onDownloadClick}
						>
							<Download className="size-4" aria-hidden />
							Download
						</Button>
					</div>
				)}
				{status === "pending_verification" && !isVendor && (
					<div className="grid w-full grid-cols-2 gap-2">
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={onViewClick}
						>
							<Eye className="size-4" aria-hidden />
							View
						</Button>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							onClick={onDownloadClick}
						>
							<Download className="size-4" aria-hidden />
							Download
						</Button>
					</div>
				)}

				{status === "pending_verification" && isVendor && (
					<div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
						<Button
							type="button"
							variant="outline"
							className="border-primary text-primary w-full"
							onClick={onViewClick}
						>
							<Eye className="size-4" aria-hidden />
							View
						</Button>
						<Button
							type="button"
							className="w-full bg-green-600 text-white hover:bg-green-600/90"
							disabled={isReviewActionPending}
							onClick={onApproveClick}
						>
							<Check className="size-4" aria-hidden />
							Approve
						</Button>
						<Button
							type="button"
							variant="destructive"
							className="w-full"
							disabled={isReviewActionPending}
							onClick={onRejectClick}
						>
							<X className="size-4" aria-hidden />
							Reject
						</Button>
					</div>
				)}
			</CardFooter>
		</Card>
	);
}

function StatusRowApi({
	status,
}: {
	status: CandidateDocumentWalletItem["status"];
}) {
	if (status === "approved") {
		return (
			<Badge variant="success" className="gap-1">
				<Check className="size-3.5" aria-hidden />
				Approved
			</Badge>
		);
	}
	if (status === "pending_verification") {
		return (
			<Badge variant="warning" className="gap-1">
				<Clock className="size-3.5" aria-hidden />
				Pending Verification
			</Badge>
		);
	}
	if (status === "expired") {
		return (
			<Badge variant="error" className="gap-1">
				<AlertTriangle className="size-3.5" aria-hidden />
				Expired
			</Badge>
		);
	}
	return (
		<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
			<AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden />
			<span>Pending Upload</span>
		</div>
	);
}

function DocumentRequirementCardMock({
	requirement,
	audience = "candidate",
	onUploadClick,
	onReplaceClick,
	onDownloadClick,
	onViewClick,
	onApproveClick,
	onRejectClick,
	onDeleteClick,
}: DocumentRequirementCardMockProps) {
	const {
		title,
		description,
		status,
		uploadedAt,
		expiresAt,
		fileName,
		fileSizeLabel,
		rejectionReason,
	} = requirement;

	const isVendor = audience === "vendor";

	const showFileMeta =
		status === "approved" ||
		status === "pending_verification" ||
		status === "rejected" ||
		(status === "expired" && uploadedAt);

	const showFileDetailsBox = showFileMeta && (fileName || uploadedAt);

	const showRejectionAlert =
		isVendor && status === "rejected" && Boolean(rejectionReason);

	const showCandidateEmptyDocumentMessage =
		!isVendor &&
		(status === "pending_upload" || (status === "expired" && !uploadedAt));

	const showCardContent =
		showRejectionAlert ||
		showFileDetailsBox ||
		showCandidateEmptyDocumentMessage;

	const footer = resolveDocumentRequirementFooter(isVendor, status, uploadedAt);

	return (
		<Card className="overflow-hidden border shadow-sm">
			<CardHeader className="space-y-3">
				<div className="flex gap-3">
					<div className="bg-muted/60 flex size-10 shrink-0 items-center justify-center rounded-md">
						<FileText className="text-muted-foreground size-5" aria-hidden />
					</div>
					<div className="min-w-0 flex-1 space-y-1">
						<div className="flex items-start justify-between gap-2">
							<div>
								<p className="text-foreground font-semibold leading-tight">
									{title}
								</p>
								<p className="text-muted-foreground text-sm">{description}</p>
							</div>
							{!isVendor &&
								(status === "approved" ||
									status === "pending_verification") && (
									<button
										type="button"
										className="text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 rounded-md p-1.5 transition-colors"
										aria-label="Download"
										onClick={onDownloadClick}
									>
										<Download className="size-4" />
									</button>
								)}
						</div>
						<StatusRowMock audience={audience} status={status} />
					</div>
				</div>
			</CardHeader>

			{showCardContent && (
				<CardContent className="space-y-3 border-t pt-4">
					{showRejectionAlert && (
						<Alert variant="destructive" className="py-3">
							<AlertTitle>Rejection reason</AlertTitle>
							<AlertDescription>{rejectionReason}</AlertDescription>
						</Alert>
					)}

					{showFileDetailsBox && (
						<div className="bg-muted/40 space-y-2 rounded-lg border p-3 text-sm">
							{fileName && (
								<div className="flex flex-wrap items-baseline justify-between gap-2">
									<p className="font-semibold">{fileName}</p>
									{fileSizeLabel && (
										<span className="text-muted-foreground">
											{fileSizeLabel}
										</span>
									)}
								</div>
							)}
							{uploadedAt && (
								<p className="text-muted-foreground">Uploaded: {uploadedAt}</p>
							)}
							{expiresAt && (
								<p
									className={cn(
										"text-muted-foreground",
										status === "expired" && "text-destructive",
									)}
								>
									Expires: {expiresAt}
								</p>
							)}
						</div>
					)}

					{showCandidateEmptyDocumentMessage && (
						<p className="text-muted-foreground flex min-h-16 items-center justify-center text-center text-sm">
							No document uploaded yet
						</p>
					)}
				</CardContent>
			)}

			{footer.kind !== "none" && (
				<CardFooter className="bg-muted/20 flex flex-col gap-2 border-t pt-4 pb-4">
					{footer.kind === "upload" && (
						<Button type="button" className="w-full" onClick={onUploadClick}>
							<Upload className="size-4" aria-hidden />
							{isVendor ? "Upload" : "Upload Document"}
						</Button>
					)}

					{footer.kind === "vendor-verify" && (
						<div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
							<Button
								type="button"
								variant="outline"
								className="border-primary text-primary w-full"
								onClick={onViewClick}
							>
								<Eye className="size-4" aria-hidden />
								View
							</Button>
							<Button
								type="button"
								className="w-full bg-green-600 text-white hover:bg-green-600/90"
								onClick={onApproveClick}
							>
								<Check className="size-4" aria-hidden />
								Approve
							</Button>
							<Button
								type="button"
								variant="destructive"
								className="w-full"
								onClick={onRejectClick}
							>
								<X className="size-4" aria-hidden />
								Reject
							</Button>
						</div>
					)}

					{footer.kind === "vendor-view-delete" && (
						<VendorViewDeleteActions
							onViewClick={onViewClick}
							onDeleteClick={onDeleteClick}
						/>
					)}

					{footer.kind === "candidate-doc-actions" && (
						<div
							className={cn(
								"grid w-full gap-2",
								footer.showReplace ? "grid-cols-2" : "grid-cols-1",
							)}
						>
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={onViewClick}
							>
								<Eye className="size-4" aria-hidden />
								View
							</Button>
							{footer.showReplace && (
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={onReplaceClick}
								>
									<Upload className="size-4" aria-hidden />
									Upload
								</Button>
							)}
						</div>
					)}
				</CardFooter>
			)}
		</Card>
	);
}

type DocumentRequirementFooter =
	| { kind: "none" }
	| { kind: "upload" }
	| { kind: "vendor-verify" }
	| { kind: "vendor-view-delete" }
	| { kind: "candidate-doc-actions"; showReplace: boolean };

function resolveDocumentRequirementFooter(
	isVendor: boolean,
	status: DocumentWalletRequirement["status"],
	uploadedAt: string | undefined,
): DocumentRequirementFooter {
	if (status === "pending_upload") {
		return { kind: "upload" };
	}
	if (!isVendor && status === "expired" && !uploadedAt) {
		return { kind: "upload" };
	}
	if (isVendor && status === "pending_verification") {
		return { kind: "vendor-verify" };
	}
	if (isVendor && (status === "approved" || status === "rejected")) {
		return { kind: "vendor-view-delete" };
	}
	if (!isVendor && status === "rejected") {
		return { kind: "upload" };
	}
	if (
		!isVendor &&
		(status === "pending_verification" ||
			status === "approved" ||
			(status === "expired" && Boolean(uploadedAt)))
	) {
		return {
			kind: "candidate-doc-actions",
			showReplace: status === "expired" && Boolean(uploadedAt),
		};
	}
	return { kind: "none" };
}

function VendorViewDeleteActions({
	onViewClick,
	onDeleteClick,
}: {
	onViewClick?: () => void;
	onDeleteClick?: () => void;
}) {
	return (
		<div className="flex w-full gap-2">
			<Button
				type="button"
				variant="outline"
				className="border-primary text-primary flex-1"
				onClick={onViewClick}
			>
				<Eye className="size-4" aria-hidden />
				View
			</Button>
			<Button
				type="button"
				variant="outline"
				size="icon"
				className="text-destructive shrink-0"
				aria-label="Delete document"
				onClick={onDeleteClick}
			>
				<Trash2 className="size-4" />
			</Button>
		</div>
	);
}

function StatusRowMock({
	audience,
	status,
}: {
	audience: DocumentRequirementAudience;
	status: DocumentWalletRequirement["status"];
}) {
	if (status === "approved") {
		return (
			<Badge variant="success" className="gap-1">
				<Check className="size-3.5" aria-hidden />
				Approved
			</Badge>
		);
	}
	if (status === "pending_verification") {
		return (
			<Badge variant="warning" className="gap-1">
				<Clock className="size-3.5" aria-hidden />
				Pending Verification
			</Badge>
		);
	}
	if (
		status === "expired" ||
		(status === "rejected" && audience === "candidate")
	) {
		return (
			<Badge variant="error" className="gap-1">
				<AlertTriangle className="size-3.5" aria-hidden />
				Expired
			</Badge>
		);
	}
	if (status === "rejected") {
		return (
			<Badge variant="error" className="gap-1">
				<CircleX className="size-3.5" aria-hidden />
				Rejected
			</Badge>
		);
	}
	if (audience === "vendor") {
		return (
			<Badge variant="inactive" className="gap-1">
				<AlertTriangle className="size-3.5" aria-hidden />
				Missing
			</Badge>
		);
	}
	return (
		<div className="text-muted-foreground flex items-center gap-1.5 text-sm">
			<AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden />
			<span>Pending Upload</span>
		</div>
	);
}
