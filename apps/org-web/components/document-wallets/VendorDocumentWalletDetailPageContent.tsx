"use client";

import {
	COMPLIANCE_LIST_ITEM_CATEGORIES,
	getComplianceListItemCategoryLabel,
	VendorUserRole,
} from "@repo/shared";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { FolderOpen } from "lucide-react";
import { useState } from "react";
import { DocumentWalletCategoryCollapsible } from "@/components/document-wallet/DocumentWalletCategoryCollapsible";
import { DocumentWalletSummaryCard } from "@/components/document-wallet/DocumentWalletSummaryCard";
import { useAuth } from "@/contexts/auth.context";
import { useVendorDocumentWalletDetailPage } from "@/hooks/vendor/use-vendor-document-wallet-detail-page";
import {
	DocumentWalletSkeleton,
	ItemsSkeleton,
	SummarySkeleton,
} from "../document-wallet/DocumentWalletSkeleton";

export interface VendorDocumentWalletDetailPageContentProps {
	candidateId: string;
}

export function VendorDocumentWalletDetailPageContent({
	candidateId,
}: VendorDocumentWalletDetailPageContentProps) {
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const { session } = useAuth();
	const isVendorViewOnly =
		session.user.subRole === VendorUserRole.VENDOR_VIEW_ONLY;

	const {
		setPage,
		search,
		setSearch,
		categoryKey,
		setCategoryKey,
		summaryQuery,
		itemsQuery,
		openDocument,
		runComplianceReview,
		reviewActionItemId,
	} = useVendorDocumentWalletDetailPage(candidateId);

	if (summaryQuery.isError) {
		return (
			<Empty className="border-muted/50 py-12">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<FolderOpen className="size-5" />
					</EmptyMedia>
					<EmptyTitle>Candidate not found</EmptyTitle>
					<EmptyDescription>
						This candidate may not belong to your vendor or the link is invalid.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	if (summaryQuery.isLoading || !summaryQuery.data) {
		return <DocumentWalletSkeleton />;
	}

	const { candidate, ...summary } = summaryQuery.data;
	const items = itemsQuery.data;
	const isItemsLoading = itemsQuery.isLoading;

	const contactLine = [candidate.email, candidate.phone]
		.filter(Boolean)
		.join(" · ");

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
			<ConfigPageHeader
				title={candidate.name}
				total={items?.total ?? 0}
				itemLabel="document"
				itemLabelPlural="documents"
				description={`${candidate.specialty}${contactLine ? ` · ${contactLine}` : ""}`}
				backLink={{
					href: "/vendor/document-wallets",
					label: "Back to Document Wallets",
				}}
			/>

			{summaryQuery.isFetching && !summary ? (
				<SummarySkeleton />
			) : (
				<DocumentWalletSummaryCard summary={summary} readOnly />
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
								: "When this organization assigns a compliance wallet for this role, requirements will appear here."}
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
								vendorMode
								onCategoryUploadClick={() => undefined}
								onUploadItem={() => undefined}
								onReplaceItem={() => undefined}
								onViewItem={(item) => {
									void openDocument(item.complianceListItemId);
								}}
								onDownloadItem={(item) => {
									void openDocument(item.complianceListItemId);
								}}
								onApproveItem={
									isVendorViewOnly
										? undefined
										: (item) => runComplianceReview(item, "APPROVED")
								}
								onRejectItem={
									isVendorViewOnly
										? undefined
										: (item) => runComplianceReview(item, "PENDING")
								}
								reviewActionPendingForId={reviewActionItemId}
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
		</div>
	);
}
