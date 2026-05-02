"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { FolderOpen } from "lucide-react";
import { DocumentWalletCategoryCollapsible } from "@/components/document-wallet/DocumentWalletCategoryCollapsible";
import { DocumentWalletListFilters } from "@/components/document-wallet/DocumentWalletListFilters";
import { DocumentWalletSummaryCard } from "@/components/document-wallet/DocumentWalletSummaryCard";
import { DocumentWalletUploadDialog } from "@/components/document-wallet/DocumentWalletUploadDialog";
import { useDocumentWalletPage } from "@/hooks/candidate/use-document-wallet-page";
import type { CandidateDocumentWalletItem } from "@/types/candidate-document-wallet";

export function DocumentWalletPageContent() {
	const {
		onboardingLoading,
		organizationId,
		summary,
		items,
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

	if (onboardingLoading) {
		return null;
	}

	if (!organizationId || !summary || !items) {
		return null;
	}

	const handleItemAction = (item: CandidateDocumentWalletItem) => {
		openUpload(item.complianceListItemId);
	};

	return (
		<div className="space-y-6">
			<DocumentWalletSummaryCard
				summary={summary}
				onUploadClick={() => openUpload()}
			/>

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
