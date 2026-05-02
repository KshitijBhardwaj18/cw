"use client";

import { VendorUserRole } from "@repo/shared";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { FolderOpen } from "lucide-react";
import { DocumentWalletCategoryCollapsible } from "@/components/document-wallet/DocumentWalletCategoryCollapsible";
import { DocumentWalletListFilters } from "@/components/document-wallet/DocumentWalletListFilters";
import { DocumentWalletSummaryCard } from "@/components/document-wallet/DocumentWalletSummaryCard";
import { useAuth } from "@/contexts/auth.context";
import { useVendorDocumentWalletDetailPage } from "@/hooks/vendor/use-vendor-document-wallet-detail-page";

export interface VendorDocumentWalletDetailPageContentProps {
	candidateId: string;
}

export function VendorDocumentWalletDetailPageContent({
	candidateId,
}: VendorDocumentWalletDetailPageContentProps) {
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
		return (
			<div className="space-y-6">
				<Skeleton className="h-24 w-full max-w-lg rounded-lg" />
				<Skeleton className="h-48 w-full rounded-lg" />
			</div>
		);
	}

	const { candidate, ...summary } = summaryQuery.data;

	const contactLine = [candidate.email, candidate.phone]
		.filter(Boolean)
		.join(" · ");

	if (!itemsQuery.data) {
		return (
			<div className="space-y-6">
				<ConfigPageHeader
					title={candidate.name}
					total={0}
					itemLabel="document"
					itemLabelPlural="documents"
					description={`${candidate.specialty}${contactLine ? ` · ${contactLine}` : ""}`}
					backLink={{
						href: "/vendor/document-wallets",
						label: "Back to Document Wallets",
					}}
				/>
				<Skeleton className="h-64 w-full rounded-lg" />
			</div>
		);
	}

	const items = itemsQuery.data;

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title={candidate.name}
				total={items.total}
				itemLabel="document"
				itemLabelPlural="documents"
				description={`${candidate.specialty}${contactLine ? ` · ${contactLine}` : ""}`}
				backLink={{
					href: "/vendor/document-wallets",
					label: "Back to Document Wallets",
				}}
			/>

			<DocumentWalletSummaryCard summary={summary} readOnly />

			<DocumentWalletListFilters
				search={search}
				onSearchChange={setSearch}
				categoryKey={categoryKey}
				onCategoryKeyChange={setCategoryKey}
			/>

			{items.total === 0 ? (
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
