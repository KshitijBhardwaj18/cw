"use client";

import {
	formatTzApiDate,
	getCandidateComplianceStatusLabel,
	getCandidateComplianceStatusVariant,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
	AlertCircle,
	CheckCircle2,
	ExternalLink,
	FileText,
	Loader2,
	Upload,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { buildPlaceholderWalletItem } from "@/components/document-wallet/build-placeholder-wallet-item";
import { ComplianceRejectDialog } from "@/components/document-wallet/ComplianceRejectDialog";
import { DocumentWalletUploadDialog } from "@/components/document-wallet/DocumentWalletUploadDialog";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import {
	useVendorUpdateCandidateComplianceStatus,
	useVendorUploadCandidateDocumentForRequisition,
} from "@/queries/vendor-candidate-document-wallet.queries";
import { useVendorCandidateAcceptanceCriteriaStatus } from "@/queries/vendor-requisitions.queries";
import type { VendorCandidateAcceptanceCriterionItem } from "@/services/vendor-requisitions.service";

interface Props {
	requisitionId: string;
	candidateId: string;
	onAllApprovedChange?: (allApproved: boolean) => void;
}

export function VendorComplianceSection({
	requisitionId,
	candidateId,
	onAllApprovedChange,
}: Readonly<Props>) {
	const { tz } = useUserTimezone();
	const query = useVendorCandidateAcceptanceCriteriaStatus(
		requisitionId,
		candidateId,
	);
	const updateStatus = useVendorUpdateCandidateComplianceStatus(candidateId);
	const uploadMutation = useVendorUploadCandidateDocumentForRequisition(
		candidateId,
		requisitionId,
	);
	const [uploadItem, setUploadItem] =
		useState<VendorCandidateAcceptanceCriterionItem | null>(null);
	const [rejectItem, setRejectItem] =
		useState<VendorCandidateAcceptanceCriterionItem | null>(null);

	const allApprovedFromData = query.data?.allApproved ?? false;
	useEffect(() => {
		onAllApprovedChange?.(allApprovedFromData);
	}, [allApprovedFromData, onAllApprovedChange]);

	if (query.isLoading) {
		return (
			<div className="space-y-2">
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
			</div>
		);
	}

	if (query.isError) {
		return (
			<div className="text-destructive text-sm">
				{query.error instanceof Error
					? query.error.message
					: "Could not load compliance items."}
			</div>
		);
	}

	const items = query.data?.items ?? [];
	const allApproved = query.data?.allApproved ?? false;

	if (items.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-4 text-muted-foreground text-sm">
				No compliance items required for this job.
			</div>
		);
	}

	const handleApprove = (item: VendorCandidateAcceptanceCriterionItem) => {
		updateStatus.mutate(
			{
				complianceListItemId: item.id,
				body: { status: "APPROVED" },
			},
			{
				onSuccess: () => toast.success("Item approved"),
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to update status",
					),
			},
		);
	};

	const confirmReject = (reason: string) => {
		if (!rejectItem) return;
		updateStatus.mutate(
			{
				complianceListItemId: rejectItem.id,
				body: { status: "REJECTED", notes: reason },
			},
			{
				onSuccess: () => {
					toast.success("Item rejected");
					setRejectItem(null);
				},
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to update status",
					),
			},
		);
	};

	const dialogItem = uploadItem ? buildPlaceholderWalletItem(uploadItem) : null;

	const missingCount = items.filter((i) => !i.satisfied).length;

	return (
		<>
			<div className="space-y-3">
				<div className="flex items-center justify-between gap-2">
					<div>
						<h5 className="font-bold text-foreground text-base">
							Compliance Checklist Items ({items.length} item
							{items.length === 1 ? "" : "s"} of submission)
						</h5>
						<p className="text-muted-foreground text-xs">
							{allApproved
								? "All required items are approved."
								: `Approve ${missingCount} item${missingCount === 1 ? "" : "s"} before submitting the candidate.`}
						</p>
					</div>
					{allApproved ? (
						<Badge variant="default" className="bg-emerald-600">
							<CheckCircle2 className="size-3.5" data-icon="inline-start" />
							All approved
						</Badge>
					) : (
						<Badge variant="destructive">
							<AlertCircle className="size-3.5" data-icon="inline-start" />
							{missingCount} pending
						</Badge>
					)}
				</div>

				<div className="space-y-2">
					{items.map((item) => (
						<div
							key={item.id}
							className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
						>
							<div className="min-w-0 flex-1 space-y-1">
								<div className="flex items-center gap-2">
									<FileText className="text-muted-foreground size-4 shrink-0" />
									<p className="truncate text-sm font-medium">{item.name}</p>
									<Badge
										variant={getCandidateComplianceStatusVariant(item.status)}
										className="shrink-0"
									>
										{getCandidateComplianceStatusLabel(item.status)}
									</Badge>
								</div>
								{item.documentName && (
									<p className="text-muted-foreground pl-6 text-xs">
										{item.documentName}
										{item.expirationDate
											? ` • Expires ${formatTzApiDate(item.expirationDate, tz)}`
											: null}
									</p>
								)}
								{item.status === "REJECTED" && item.rejectionReason && (
									<p className="pl-6 text-xs text-destructive">
										Rejection reason: {item.rejectionReason}
									</p>
								)}
							</div>
							<div className="flex flex-wrap items-center gap-2">
								{item.responseStyle === "LINK" && item.link && (
									<Button type="button" size="sm" variant="outline" asChild>
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink
												className="size-4"
												data-icon="inline-start"
											/>
											Visit Link
										</a>
									</Button>
								)}
								{item.responseStyle === "DOWNLOAD_AND_UPLOAD" && item.link && (
									<Button type="button" size="sm" variant="outline" asChild>
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink
												className="size-4"
												data-icon="inline-start"
											/>
											Download
										</a>
									</Button>
								)}
								{item.status === "PENDING_REVIEW" && (
									<>
										<Button
											type="button"
											size="sm"
											disabled={updateStatus.isPending}
											onClick={() => handleApprove(item)}
										>
											{updateStatus.isPending ? (
												<Loader2
													className="size-4 animate-spin"
													data-icon="inline-start"
												/>
											) : (
												<CheckCircle2
													className="size-4"
													data-icon="inline-start"
												/>
											)}
											Approve
										</Button>
										<Button
											type="button"
											size="sm"
											variant="outline"
											disabled={updateStatus.isPending}
											onClick={() => setRejectItem(item)}
										>
											<X className="size-4" data-icon="inline-start" />
											Reject
										</Button>
										{item.responseStyle !== "LINK" && (
											<Button
												type="button"
												size="sm"
												variant="outline"
												onClick={() => setUploadItem(item)}
											>
												<Upload className="size-4" data-icon="inline-start" />
												Replace
											</Button>
										)}
									</>
								)}
								{(item.status === "MISSING" ||
									item.status === "EXPIRED" ||
									item.status === "REJECTED") &&
									item.responseStyle !== "LINK" && (
										<Button
											type="button"
											size="sm"
											onClick={() => setUploadItem(item)}
										>
											<Upload className="size-4" data-icon="inline-start" />
											{item.status === "REJECTED" ? "Replace" : "Upload"}
										</Button>
									)}
							</div>
						</div>
					))}
				</div>
			</div>

			<DocumentWalletUploadDialog
				open={!!uploadItem}
				onOpenChange={(o) => !o && setUploadItem(null)}
				item={dialogItem}
				uploadMutation={uploadMutation}
			/>

			<ComplianceRejectDialog
				open={!!rejectItem}
				onOpenChange={(o) => !o && setRejectItem(null)}
				itemName={rejectItem?.name ?? null}
				onConfirm={confirmReject}
				isSubmitting={updateStatus.isPending}
			/>
		</>
	);
}
