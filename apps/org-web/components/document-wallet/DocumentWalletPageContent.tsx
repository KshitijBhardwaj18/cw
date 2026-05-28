"use client";

import {
	COMPLIANCE_LIST_ITEM_CATEGORIES,
	getComplianceListItemCategoryLabel,
} from "@repo/shared";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { FolderOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentWalletCategoryCollapsible } from "@/components/document-wallet/DocumentWalletCategoryCollapsible";
import { DocumentWalletSummaryCard } from "@/components/document-wallet/DocumentWalletSummaryCard";
import { DocumentWalletUploadDialog } from "@/components/document-wallet/DocumentWalletUploadDialog";
import { useDocumentWalletPage } from "@/hooks/candidate/use-document-wallet-page";
import { useMarkCandidateComplianceLinkSubmitted } from "@/queries/candidate-document-wallet.queries";
import type { CandidateDocumentWalletItem } from "@/types/candidate-document-wallet";
import {
	DocumentWalletSkeleton,
	ItemsSkeleton,
	SummarySkeleton,
} from "./DocumentWalletSkeleton";

export function DocumentWalletPageContent() {
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const {
		onboardingLoading,
		organizationId,
		summary,
		isSummaryLoading,
		items,
		isItemsLoading,
		page,
		setPage,
		limit,
		setLimit,
		pageSizeOptions,
		search,
		setSearch,
		categoryKey,
		setCategoryKey,
		uploadMutation,
		openDocument,
		uploadOpen,
		setUploadOpen,
		openUpload,
		defaultComplianceListItemId,
	} = useDocumentWalletPage();

	const markLinkMutation = useMarkCandidateComplianceLinkSubmitted();

	if (onboardingLoading || !organizationId) {
		return <DocumentWalletSkeleton />;
	}

	const handleItemAction = (item: CandidateDocumentWalletItem) => {
		openUpload(item.complianceListItemId);
	};

	const handleMarkLinkItem = (item: CandidateDocumentWalletItem) => {
		markLinkMutation.mutate(item.complianceListItemId, {
			onSuccess: () => toast.success("Marked as submitted"),
			onError: (err) =>
				toast.error(
					err instanceof Error ? err.message : "Failed to mark as submitted",
				),
		});
	};

	const filterConfigs = [
		{
			id: "category",
			label: "Category",
			value: categoryKey ?? "all",
			onValueChange: (v: string) => setCategoryKey(v === "all" ? undefined : v),
			placeholder: "All Categories",
			options: [
				{ value: "all", label: "All Categories" },
				...COMPLIANCE_LIST_ITEM_CATEGORIES.map((c) => ({
					value: c,
					label: getComplianceListItemCategoryLabel(c),
				})),
			],
		},
	];

	return (
		<div className="space-y-6">
			{isSummaryLoading || !summary ? (
				<SummarySkeleton />
			) : (
				<DocumentWalletSummaryCard summary={summary} />
			)}

			<SearchWithFilters
				searchPlaceholder="Search requirements…"
				searchValue={search}
				onSearchChange={setSearch}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			{isItemsLoading || !items ? (
				<ItemsSkeleton />
			) : items.total === 0 ? (
				<Empty className="border-muted/50 py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<FolderOpen className="size-5" />
						</EmptyMedia>
						<EmptyTitle>
							{search.trim()
								? "No matching requirements"
								: "No requirements yet"}
						</EmptyTitle>
						<EmptyDescription>
							{search.trim()
								? "Try a different search or clear filters."
								: "When you are assigned to a role, your organization's compliance checklist will appear here."}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<>
					<div className="space-y-4">
						{items.categories.map((category) => (
							<DocumentWalletCategoryCollapsible
								key={category.categoryKey}
								category={category}
								onUploadItem={handleItemAction}
								onReplaceItem={handleItemAction}
								onViewItem={(item) => {
									void openDocument(item.complianceListItemId);
								}}
								onDownloadItem={(item) => {
									void openDocument(item.complianceListItemId);
								}}
								onMarkLinkItem={handleMarkLinkItem}
								markingLinkForId={
									markLinkMutation.isPending
										? (markLinkMutation.variables ?? null)
										: null
								}
							/>
						))}
					</div>

					<PaginationControls
						currentPage={page}
						pageCount={items.totalPages}
						goToPage={setPage}
						limit={limit}
						setLimit={setLimit}
						pageSizeOptions={pageSizeOptions}
						totalItems={items.total}
						itemLabel="requirement"
						itemLabelPlural="requirements"
					/>
				</>
			)}

			<DocumentWalletUploadDialog
				open={uploadOpen}
				onOpenChange={setUploadOpen}
				item={
					(items?.categories
						.flatMap((c) => c.items)
						.find(
							(i) => i.complianceListItemId === defaultComplianceListItemId,
						) ??
						null) ||
					null
				}
				uploadMutation={uploadMutation}
			/>
		</div>
	);
}
