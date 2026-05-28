"use client";

import { Action, useAbility } from "@repo/casl";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { buildPlaceholderWalletItem } from "@/components/document-wallet/build-placeholder-wallet-item";
import { ComplianceRejectDialog } from "@/components/document-wallet/ComplianceRejectDialog";
import { DocumentWalletUploadDialog } from "@/components/document-wallet/DocumentWalletUploadDialog";
import { usePlacementComplianceTab } from "@/hooks/use-placement-compliance-tab";
import {
	useMarkCandidateComplianceLinkSubmitted,
	useUpdateCandidateComplianceStatus,
	useUploadCandidateComplianceDocument,
} from "@/queries/placements.queries";
import {
	useVendorMarkPlacementComplianceLinkSubmitted,
	useVendorUpdatePlacementComplianceStatus,
	useVendorUploadPlacementComplianceDocument,
} from "@/queries/vendor-placement-compliance.queries";
import type { PlacementComplianceItemRow } from "@/types/placement-compliance";
import { AddComplianceItemDialog } from "./AddComplianceItemDialog";
import { ComplianceCategorySection } from "./ComplianceCategorySection";
import { ComplianceStatusCard } from "./ComplianceStatusCard";

interface PlacementComplianceTabContentProps {
	placementId: string;
	mode: "org" | "vendor";
}

export function PlacementComplianceTabContent({
	placementId,
	mode = "org",
}: Readonly<PlacementComplianceTabContentProps>) {
	const ability = useAbility();
	const canAddPlacementComplianceItems =
		mode === "org" && ability.can(Action.Update, "PlacementComplianceItem");
	const canRemovePlacementExtras =
		mode === "org" && ability.can(Action.Delete, "PlacementComplianceItem");
	const canReview = ability.can(Action.Update, "Credentials");

	const {
		isLoading,
		error,
		total,
		complete,
		missing,
		expired,
		pending,
		categories,
		addDialogOpen,
		setAddDialogOpen,
		expandedAuditItemId,
		toggleAuditLog,
		handleRemove,
		handleAddSelected,
		isAddPending,
	} = usePlacementComplianceTab(placementId);

	const orgUpdate = useUpdateCandidateComplianceStatus(placementId);
	const orgUpload = useUploadCandidateComplianceDocument(placementId);
	const orgMarkLink = useMarkCandidateComplianceLinkSubmitted(placementId);
	const vendorUpdate = useVendorUpdatePlacementComplianceStatus(placementId);
	const vendorUpload = useVendorUploadPlacementComplianceDocument(placementId);
	const vendorMarkLink =
		useVendorMarkPlacementComplianceLinkSubmitted(placementId);

	const updateMutation = mode === "vendor" ? vendorUpdate : orgUpdate;
	const uploadMutation = mode === "vendor" ? vendorUpload : orgUpload;
	const markLinkMutation = mode === "vendor" ? vendorMarkLink : orgMarkLink;

	const [rejectItem, setRejectItem] =
		useState<PlacementComplianceItemRow | null>(null);
	const [uploadItem, setUploadItem] =
		useState<PlacementComplianceItemRow | null>(null);

	const onMarkLinkSubmitted = (item: PlacementComplianceItemRow) => {
		markLinkMutation.mutate(item.complianceListItemId, {
			onSuccess: () => toast.success("Marked as submitted"),
			onError: (e) =>
				toast.error(
					e instanceof Error ? e.message : "Could not mark as submitted",
				),
		});
	};

	const onApprove = (item: PlacementComplianceItemRow) => {
		updateMutation.mutate(
			{
				complianceListItemId: item.complianceListItemId,
				body: { status: "APPROVED" },
			},
			{
				onSuccess: () => toast.success("Item approved"),
				onError: (e) =>
					toast.error(
						e instanceof Error ? e.message : "Failed to update status",
					),
			},
		);
	};

	const confirmReject = (reason: string) => {
		if (!rejectItem) return;
		updateMutation.mutate(
			{
				complianceListItemId: rejectItem.complianceListItemId,
				body: { status: "REJECTED", notes: reason || undefined },
			},
			{
				onSuccess: () => {
					toast.success("Item rejected");
					setRejectItem(null);
				},
				onError: (e) =>
					toast.error(
						e instanceof Error ? e.message : "Failed to update status",
					),
			},
		);
	};

	const dialogItem = uploadItem
		? buildPlaceholderWalletItem({
				id: uploadItem.complianceListItemId,
				name: uploadItem.name,
				instructionalNotes: null,
				expirationType: uploadItem.expirationType,
				expirationRuleValue: uploadItem.expirationRuleValue,
				expirationRuleUnit: uploadItem.expirationRuleUnit,
				responseStyle: uploadItem.responseStyle,
				link: uploadItem.link,
			})
		: null;

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-10 w-full max-w-lg" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
				</div>
				<Skeleton className="h-48 rounded-lg" />
			</div>
		);
	}

	if (error) {
		return (
			<Empty className="border py-12">
				<EmptyMedia variant="icon">
					<AlertCircle />
				</EmptyMedia>
				<EmptyHeader>
					<EmptyTitle>Failed to load compliance</EmptyTitle>
					<EmptyDescription>
						{error instanceof Error
							? error.message
							: "An error occurred. Please try again."}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const pendingActionItemId = updateMutation.isPending
		? (updateMutation.variables?.complianceListItemId ?? null)
		: null;
	const markingLinkItemId = markLinkMutation.isPending
		? (markLinkMutation.variables ?? null)
		: null;

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Compliance Requirements Comparison"
				total={total}
				itemLabel="requirement"
				itemLabelPlural="requirements"
				countText={
					total === 0
						? "No requirements yet — add items from the catalog or attach a requisition with acceptance criteria"
						: `${complete} complete, ${pending} pending review, ${missing} missing, ${expired} expired (${total} total)`
				}
				actions={
					canAddPlacementComplianceItems
						? [
								{
									key: "add-compliance",
									icon: <Plus className="size-4" />,
									label: "Add Compliance Item",
									onClick: () => setAddDialogOpen(true),
									disabled: isAddPending,
								},
							]
						: []
				}
			/>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<ComplianceStatusCard variant="complete" count={complete} />
				<ComplianceStatusCard variant="pending" count={pending} />
				<ComplianceStatusCard variant="missing" count={missing} />
				<ComplianceStatusCard variant="expired" count={expired} />
			</div>

			{categories.length === 0 ? (
				<p className="text-muted-foreground py-8 text-center text-sm">
					No compliance requirements are linked to this placement yet. Add items
					from the catalog, or ensure the requisition has acceptance criteria.
				</p>
			) : (
				<div className="space-y-3">
					{categories.map((category) => (
						<ComplianceCategorySection
							mode={mode}
							key={category.categoryKey}
							category={category}
							expandedAuditItemId={expandedAuditItemId}
							onRemoveItem={handleRemove}
							onToggleAudit={toggleAuditLog}
							canRemovePlacementExtras={canRemovePlacementExtras}
							canReview={canReview}
							onApprove={onApprove}
							onReject={(item) => setRejectItem(item)}
							onUpload={(item) => setUploadItem(item)}
							onMarkLinkSubmitted={onMarkLinkSubmitted}
							pendingActionItemId={pendingActionItemId}
							markingLinkItemId={markingLinkItemId}
						/>
					))}
				</div>
			)}

			<AddComplianceItemDialog
				open={addDialogOpen}
				onOpenChange={setAddDialogOpen}
				placementId={placementId}
				onAddSelected={handleAddSelected}
				isPending={isAddPending}
			/>

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
				isSubmitting={updateMutation.isPending}
			/>
		</div>
	);
}
