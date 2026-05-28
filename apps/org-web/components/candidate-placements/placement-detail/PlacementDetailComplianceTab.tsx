"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { buildPlaceholderWalletItem } from "@/components/document-wallet/build-placeholder-wallet-item";
import { DocumentWalletUploadDialog } from "@/components/document-wallet/DocumentWalletUploadDialog";
import { ComplianceCategorySection } from "@/components/placements/ComplianceCategorySection";
import { ComplianceStatusCard } from "@/components/placements/ComplianceStatusCard";
import {
	useMarkCandidatePlacementComplianceLinkSubmitted,
	useUploadCandidatePlacementComplianceItem,
} from "@/queries/candidate-document-wallet.queries";
import { useCandidatePlacementCompliance } from "@/queries/candidate-placements.queries";
import type { PlacementComplianceItemRow } from "@/types/placement-compliance";

export function PlacementDetailComplianceTab({
	placementId,
}: Readonly<{
	placementId: string;
}>) {
	const [expandedAuditItemId, setExpandedAuditItemId] = useState<string | null>(
		null,
	);
	const [uploadItem, setUploadItem] =
		useState<PlacementComplianceItemRow | null>(null);
	const { data, isPending, isError, error } = useCandidatePlacementCompliance(
		placementId,
		true,
	);
	const uploadMutation = useUploadCandidatePlacementComplianceItem(placementId);
	const markLinkMutation =
		useMarkCandidatePlacementComplianceLinkSubmitted(placementId);

	const toggleAudit = (id: string) => {
		setExpandedAuditItemId((prev) => (prev === id ? null : id));
	};

	const noopRemove = (_itemId: string) => {};

	const handleMarkLink = (item: PlacementComplianceItemRow) => {
		markLinkMutation.mutate(item.complianceListItemId, {
			onSuccess: () => toast.success("Marked as submitted"),
			onError: (e) =>
				toast.error(
					e instanceof Error ? e.message : "Could not mark as submitted",
				),
		});
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

	if (isPending) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
					<Skeleton className="h-24 rounded-lg" />
				</div>
				<Skeleton className="h-48 rounded-lg" />
			</div>
		);
	}

	if (isError) {
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

	if (!data) {
		return null;
	}

	const { summary, categories } = data;
	const { complete, missing, expired, total } = summary;
	const markingLinkItemId = markLinkMutation.isPending
		? (markLinkMutation.variables ?? null)
		: null;

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Compliance</h2>
				<p className="text-muted-foreground mt-1 text-sm">
					{complete} complete, {missing} missing, {expired} expired ({total}{" "}
					total)
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<ComplianceStatusCard variant="complete" count={complete} />
				<ComplianceStatusCard variant="missing" count={missing} />
				<ComplianceStatusCard variant="expired" count={expired} />
			</div>

			<div className="space-y-4">
				{categories.map((category) => (
					<ComplianceCategorySection
						key={category.categoryKey}
						category={category}
						expandedAuditItemId={expandedAuditItemId}
						mode="candidate"
						onRemoveItem={noopRemove}
						onToggleAudit={toggleAudit}
						canSubmit
						onUpload={(item) => setUploadItem(item)}
						onMarkLinkSubmitted={handleMarkLink}
						markingLinkItemId={markingLinkItemId}
					/>
				))}
			</div>

			<DocumentWalletUploadDialog
				open={!!uploadItem}
				onOpenChange={(o) => !o && setUploadItem(null)}
				item={dialogItem}
				uploadMutation={uploadMutation}
			/>
		</div>
	);
}
