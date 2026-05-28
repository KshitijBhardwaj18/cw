"use client";

import {
	getCandidateComplianceStatusLabel,
	getCandidateComplianceStatusVariant,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@repo/ui/components/card";
import { getCandidateComplianceStatusIcon } from "@repo/ui/lib/compliance-status-icon";
import { cn } from "@repo/ui/lib/utils";
import {
	AlertTriangle,
	Check,
	CheckCircle2,
	Clock,
	Download,
	ExternalLink,
	Eye,
	FileText,
	Upload,
	X,
} from "lucide-react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { CandidateDocumentWalletItem } from "@/types/candidate-document-wallet";
import { formatVendorPlacementCalendarDay } from "@/utils/vendor-calendar-display";

export type DocumentRequirementAudience = "candidate" | "vendor";

export interface DocumentRequirementCardProps {
	requirement: CandidateDocumentWalletItem;
	onUploadClick: () => void;
	onReplaceClick: () => void;
	onMarkLinkClick?: () => void;
	isMarkingLink?: boolean;
	onDownloadClick?: () => void;
	onViewClick?: () => void;
	audience?: DocumentRequirementAudience;
	onApproveClick?: () => void;
	onRejectClick?: () => void;
	isReviewActionPending?: boolean;
}

export function DocumentRequirementCard({
	requirement,
	onUploadClick,
	onReplaceClick,
	onMarkLinkClick,
	isMarkingLink = false,
	onDownloadClick,
	onViewClick,
	audience = "candidate",
	onApproveClick,
	onRejectClick,
	isReviewActionPending,
}: Readonly<DocumentRequirementCardProps>) {
	const {
		title,
		description,
		status,
		uploadedAt,
		expiresAt,
		documentFileName,
		responseStyle,
		link,
		rejectionReason,
	} = requirement;

	const { fmtShortDate, fmtDateTime, fmtCalendarDate } = useUserTimezone();
	const isVendor = audience === "vendor";
	const isLink = responseStyle === "LINK";

	const uploadedLabel = uploadedAt ? fmtDateTime(uploadedAt) : undefined;
	const expiresLabel = expiresAt
		? formatVendorPlacementCalendarDay(expiresAt, fmtCalendarDate, fmtShortDate)
		: undefined;

	const showFileMeta =
		status === "APPROVED" ||
		status === "PENDING_REVIEW" ||
		(status === "EXPIRED" && uploadedLabel) ||
		(status === "REJECTED" && uploadedLabel);

	return (
		<Card className="overflow-hidden border shadow-sm">
			<CardHeader className="space-y-3 pb-3">
				<div className="flex gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted/60">
						<FileText className="size-5 text-muted-foreground" aria-hidden />
					</div>
					<div className="min-w-0 flex-1 space-y-1">
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
						<StatusRow status={status} />
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
									status === "EXPIRED" && "text-destructive",
								)}
							>
								<AlertTriangle className="size-4 shrink-0" aria-hidden />
								<span>Expires: {expiresLabel}</span>
							</div>
						)}
					</div>
				)}

				{(status === "MISSING" || (status === "EXPIRED" && !uploadedLabel)) && (
					<p className="flex min-h-16 items-center justify-center text-center text-sm text-muted-foreground">
						No document uploaded yet
					</p>
				)}

				{status === "REJECTED" && rejectionReason && (
					<div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
						<X
							className="size-4 shrink-0 text-destructive mt-0.5"
							aria-hidden
						/>
						<div className="min-w-0 space-y-1">
							<p className="font-medium text-destructive">Rejection reason</p>
							<p className="text-muted-foreground break-words">
								{rejectionReason}
							</p>
						</div>
					</div>
				)}
			</CardContent>

			<CardFooter className="flex flex-col gap-2 border-t bg-muted/20 pt-4 pb-4">
				{isLink && link && (
					<Button type="button" variant="outline" className="w-full" asChild>
						<a href={link} target="_blank" rel="noopener noreferrer">
							<ExternalLink className="size-4" aria-hidden />
							Visit Link
						</a>
					</Button>
				)}

				{isLink &&
					(status === "MISSING" ||
						status === "EXPIRED" ||
						status === "REJECTED") &&
					!isVendor &&
					onMarkLinkClick && (
						<Button
							type="button"
							className="w-full"
							disabled={isMarkingLink}
							onClick={onMarkLinkClick}
						>
							<CheckCircle2 className="size-4" aria-hidden />
							{isMarkingLink ? "Marking…" : "Mark as Submitted"}
						</Button>
					)}

				{isLink && status === "MISSING" && isVendor && (
					<p className="text-center text-sm text-muted-foreground">
						The candidate marks the link as submitted from their portal.
					</p>
				)}

				{!isLink && status === "MISSING" && !isVendor && (
					<Button type="button" className="w-full" onClick={onUploadClick}>
						<Upload className="size-4" aria-hidden />
						Upload Document
					</Button>
				)}

				{!isLink && status === "MISSING" && isVendor && (
					<p className="text-center text-sm text-muted-foreground">
						The candidate uploads documents from their portal.
					</p>
				)}

				{!isLink && status === "APPROVED" && (
					<div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
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

				{!isLink &&
					status === "PENDING_REVIEW" &&
					uploadedLabel &&
					!isVendor && (
						<div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
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

				{!isLink &&
					(status === "EXPIRED" || status === "REJECTED") &&
					uploadedLabel &&
					!isVendor && (
						<div className="flex w-full flex-col gap-2">
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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

				{!isLink &&
					(status === "EXPIRED" || status === "REJECTED") &&
					uploadedLabel &&
					isVendor && (
						<div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
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

				{status === "PENDING_REVIEW" && isVendor && (
					<div
						className={cn(
							"grid w-full grid-cols-1 gap-2",
							isLink ? "sm:grid-cols-2" : "sm:grid-cols-3",
						)}
					>
						{!isLink && (
							<Button
								type="button"
								variant="outline"
								className="border-primary text-primary w-full"
								onClick={onViewClick}
							>
								<Eye className="size-4" aria-hidden />
								View
							</Button>
						)}
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

function StatusRow({
	status,
}: Readonly<{
	status: CandidateDocumentWalletItem["status"];
}>) {
	const Icon = getCandidateComplianceStatusIcon(status);
	return (
		<Badge
			variant={getCandidateComplianceStatusVariant(status)}
			className="gap-1"
		>
			<Icon className="size-3.5" aria-hidden />
			{getCandidateComplianceStatusLabel(status)}
		</Badge>
	);
}
