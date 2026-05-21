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
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { FolderOpen } from "lucide-react";
import { useState } from "react";
import { DocumentWalletCategoryCollapsible } from "@/components/document-wallet/DocumentWalletCategoryCollapsible";
import { DocumentWalletSummaryCard } from "@/components/document-wallet/DocumentWalletSummaryCard";
import { DocumentWalletUploadDialog } from "@/components/document-wallet/DocumentWalletUploadDialog";
import { useDocumentWalletPage } from "@/hooks/candidate/use-document-wallet-page";
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
		setPage,
		search,
		setSearch,
		categoryKey,
		setCategoryKey,
		uploadMutation,
		openDocument,
		uploadOpen,
		setUploadOpen,
		openUpload,
		uploadOptionsQuery,
		defaultComplianceListItemId,
	} = useDocumentWalletPage();

	if (onboardingLoading || !organizationId) {
		return <DocumentWalletSkeleton />;
	}

	const handleItemAction = (item: CandidateDocumentWalletItem) => {
		openUpload(item.complianceListItemId);
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
				<DocumentWalletSummaryCard
					summary={summary}
					onUploadClick={() => openUpload()}
				/>
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
								onCategoryUploadClick={() => openUpload()}
								onUploadItem={handleItemAction}
								onReplaceItem={handleItemAction}
								onViewItem={(item) => {
									void openDocument(item.complianceListItemId);
								}}
								onDownloadItem={(item) => {
									void openDocument(item.complianceListItemId);
								}}
							/>
						))}
					</div>

					<ConfigPagePagination
						page={items.page}
						totalPages={items.totalPages}
						onPageChange={setPage}
					/>
				</>
			)}

			<DocumentWalletUploadDialog
				open={uploadOpen}
				onOpenChange={setUploadOpen}
				pickerItems={uploadOptionsQuery.data ?? []}
				defaultComplianceListItemId={defaultComplianceListItemId}
				uploadMutation={uploadMutation}
			/>
		</div>
	);
}
