"use client";

import {
	formatTzApiDate,
	formatTzApiDateTime,
	getCandidateComplianceStatusLabel,
	getCandidateComplianceStatusVariant,
	getComplianceListItemCategoryLabel,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { getCandidateComplianceStatusIcon } from "@repo/ui/lib/compliance-status-icon";
import {
	Check,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	ExternalLink,
	FileText,
	Loader2,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { PlacementComplianceItemRow } from "@/types/placement-compliance";

interface ComplianceItemRowProps {
	item: PlacementComplianceItemRow;
	isAuditExpanded: boolean;
	onRemove: (itemId: string) => void;
	onToggleAudit: (itemId: string) => void;
	mode: "org" | "vendor" | "candidate";
	canRemovePlacementExtras?: boolean;
	canReview?: boolean;
	canSubmit?: boolean;
	onApprove?: (item: PlacementComplianceItemRow) => void;
	onReject?: (item: PlacementComplianceItemRow) => void;
	onUpload?: (item: PlacementComplianceItemRow) => void;
	onMarkLinkSubmitted?: (item: PlacementComplianceItemRow) => void;
	pendingActionItemId?: string | null;
	markingLinkItemId?: string | null;
}

export function ComplianceItemRow({
	item,
	isAuditExpanded,
	onRemove,
	onToggleAudit,
	mode = "org",
	canRemovePlacementExtras = false,
	canReview = false,
	canSubmit = false,
	onApprove,
	onReject,
	onUpload,
	onMarkLinkSubmitted,
	pendingActionItemId,
	markingLinkItemId,
}: Readonly<ComplianceItemRowProps>) {
	const { tz } = useUserTimezone();
	const StatusIcon = getCandidateComplianceStatusIcon(item.status);
	const removeId = item.placementComplianceItemId;
	const isLink = item.responseStyle === "LINK";
	const isItemPending = pendingActionItemId === item.complianceListItemId;
	const isItemMarkingLink = markingLinkItemId === item.complianceListItemId;
	const canActOnItem = canReview || canSubmit;
	const showApproveReject = canReview && item.status === "PENDING_REVIEW";
	const showUpload =
		canActOnItem &&
		!isLink &&
		(item.status === "MISSING" ||
			item.status === "EXPIRED" ||
			item.status === "REJECTED");
	const showReplaceWhilePending =
		canActOnItem && !isLink && item.status === "PENDING_REVIEW";
	const showVisitLink = isLink && !!item.link;
	const showMarkLink =
		canActOnItem &&
		isLink &&
		(item.status === "MISSING" ||
			item.status === "EXPIRED" ||
			item.status === "REJECTED");

	return (
		<div className="bg-muted/20 px-4 py-4">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="flex items-start gap-3">
					<div className="bg-muted mt-0.5 size-2 shrink-0 rounded-full" />
					<div>
						<p className="font-medium">{item.name}</p>
						<p className="text-muted-foreground text-xs">
							{getComplianceListItemCategoryLabel(item.category)}
						</p>
						<p className="text-muted-foreground mt-1 text-xs">
							Source:{" "}
							{item.source === "requisition" ? "Requisition" : "Placement"}
						</p>
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-muted-foreground text-xs uppercase">
						Status
					</span>
					<Badge
						variant={getCandidateComplianceStatusVariant(item.status)}
						className="flex w-fit items-center gap-1"
					>
						<StatusIcon className="size-3.5" />
						{getCandidateComplianceStatusLabel(item.status)}
					</Badge>
					{item.documentName && (
						<div className="flex items-center gap-1.5 text-xs">
							<FileText className="text-primary size-3.5" />
							<span className="text-muted-foreground truncate">
								{item.documentName}
							</span>
						</div>
					)}
					{item.status === "REJECTED" && item.rejectionReason && (
						<p className="text-xs text-red-700">
							Reason: {item.rejectionReason}
						</p>
					)}
				</div>
				<div className="flex flex-row gap-8">
					<div className="flex flex-col gap-1">
						<span className="text-muted-foreground text-xs uppercase">
							Completion Date
						</span>
						<span className="text-sm">
							{formatTzApiDate(item.completionDate, tz)}
						</span>
					</div>
					{item.expirationDate != null && (
						<div className="flex flex-col gap-1">
							<span className="text-muted-foreground text-xs uppercase">
								Expiration Date
							</span>
							<span className="text-sm">
								{formatTzApiDate(item.expirationDate, tz)}
							</span>
						</div>
					)}
				</div>
			</div>

			{(() => {
				const canRemove =
					mode === "org" &&
					canRemovePlacementExtras &&
					item.canRemove &&
					!!removeId;
				const hasLeftActions =
					showApproveReject ||
					showUpload ||
					showReplaceWhilePending ||
					showVisitLink ||
					showMarkLink ||
					canRemove;
				const hasAuditLog = mode === "org";
				if (!hasLeftActions && !hasAuditLog) return null;
				return (
					<div className="mt-3 flex flex-wrap items-center justify-between gap-2">
						<div className="flex flex-wrap items-center gap-2">
							{showApproveReject && (
								<>
									<Button
										type="button"
										size="sm"
										disabled={isItemPending}
										onClick={() => onApprove?.(item)}
									>
										{isItemPending ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Check className="size-4" />
										)}
										Approve
									</Button>
									<Button
										type="button"
										size="sm"
										variant="outline"
										disabled={isItemPending}
										onClick={() => onReject?.(item)}
									>
										<X className="size-4" />
										Reject
									</Button>
								</>
							)}
							{showReplaceWhilePending && (
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={() => onUpload?.(item)}
								>
									<Upload className="size-4" />
									Replace
								</Button>
							)}
							{showUpload && (
								<Button
									type="button"
									size="sm"
									onClick={() => onUpload?.(item)}
								>
									<Upload className="size-4" />
									{item.status === "REJECTED" ? "Replace" : "Upload"}
								</Button>
							)}
							{showVisitLink && item.link && (
								<Button type="button" size="sm" variant="outline" asChild>
									<a href={item.link} target="_blank" rel="noopener noreferrer">
										<ExternalLink className="size-4" />
										Visit Link
									</a>
								</Button>
							)}
							{showMarkLink && (
								<Button
									type="button"
									size="sm"
									disabled={isItemMarkingLink}
									onClick={() => onMarkLinkSubmitted?.(item)}
								>
									{isItemMarkingLink ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<CheckCircle2 className="size-4" />
									)}
									Mark as Submitted
								</Button>
							)}
							{canRemove && (
								<Button
									variant="outline"
									size="sm"
									className="text-destructive hover:bg-destructive/10 hover:text-destructive"
									onClick={() => removeId && onRemove(removeId)}
									type="button"
								>
									<Trash2 className="size-4" />
									Remove Item
								</Button>
							)}
						</div>
						{hasAuditLog && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => onToggleAudit(item.complianceListItemId)}
								type="button"
							>
								{isAuditExpanded ? (
									<>
										<ChevronDown className="size-4" />
										Audit Log
									</>
								) : (
									<>
										<ChevronRight className="size-4" />
										Audit Log
									</>
								)}
							</Button>
						)}
					</div>
				);
			})()}

			{isAuditExpanded && item.auditLog.length > 0 && (
				<div className="mt-4 space-y-3 rounded-md bg-muted/30 p-4">
					<h4 className="font-medium">Audit Log</h4>
					<div className="space-y-3">
						{item.auditLog.map((log, idx) => (
							<div key={idx} className="rounded-md border bg-background p-3">
								<p className="font-medium">
									{log.event}
									<span className="text-muted-foreground font-normal">
										{" "}
										• {formatTzApiDateTime(log.date, tz)}
									</span>
								</p>
								<p className="text-muted-foreground mt-1 text-xs">
									Performed by: {log.performedBy}
								</p>
								<p className="text-muted-foreground mt-0.5 text-xs">
									{log.description}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
