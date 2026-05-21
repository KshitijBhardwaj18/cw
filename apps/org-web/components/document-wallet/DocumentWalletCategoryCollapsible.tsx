"use client";

import { getComplianceListItemCategoryLabel } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { ChevronDown, Upload } from "lucide-react";
import { toast } from "sonner";
import type { DocumentRequirementAudience } from "@/components/document-wallet/DocumentRequirementCard";
import { DocumentRequirementCard } from "@/components/document-wallet/DocumentRequirementCard";
import {
	type DocumentWalletCategory,
	getCategoryApprovedCount,
} from "@/components/document-wallet/mock-document-wallet";
import type { CandidateDocumentWalletItem } from "@/types/candidate-document-wallet";

export type DocumentWalletCategoryCollapsibleProps =
	| DocumentWalletCategoryCollapsibleMockProps
	| DocumentWalletCategoryCollapsibleApiProps;

type DocumentWalletCategoryCollapsibleMockProps = {
	category: DocumentWalletCategory;
	audience?: DocumentRequirementAudience;
	onUploadClick: () => void;
};

type DocumentWalletCategoryCollapsibleApiProps = {
	category: {
		categoryKey: string;
		items: CandidateDocumentWalletItem[];
	};
	onCategoryUploadClick: () => void;
	onUploadItem: (item: CandidateDocumentWalletItem) => void;
	onReplaceItem: (item: CandidateDocumentWalletItem) => void;
	onViewItem: (item: CandidateDocumentWalletItem) => void;
	onDownloadItem: (item: CandidateDocumentWalletItem) => void;
	vendorMode?: boolean;
	onApproveItem?: (item: CandidateDocumentWalletItem) => void;
	onRejectItem?: (item: CandidateDocumentWalletItem) => void;
	reviewActionPendingForId?: string | null;
};

function countApproved(items: CandidateDocumentWalletItem[]): number {
	return items.filter((i) => i.status === "approved").length;
}

export function DocumentWalletCategoryCollapsible(
	props: DocumentWalletCategoryCollapsibleProps,
) {
	if ("categoryKey" in props.category) {
		return (
			<DocumentWalletCategoryCollapsibleApi
				{...(props as DocumentWalletCategoryCollapsibleApiProps)}
			/>
		);
	}
	return (
		<DocumentWalletCategoryCollapsibleMock
			{...(props as DocumentWalletCategoryCollapsibleMockProps)}
		/>
	);
}

function DocumentWalletCategoryCollapsibleApi({
	category,
	onCategoryUploadClick,
	onUploadItem,
	onReplaceItem,
	onViewItem,
	onDownloadItem,
	vendorMode = false,
	onApproveItem,
	onRejectItem,
	reviewActionPendingForId,
}: DocumentWalletCategoryCollapsibleApiProps) {
	const complete = countApproved(category.items);
	const total = category.items.length;

	return (
		<Collapsible
			defaultOpen
			className="overflow-hidden rounded-lg border bg-card shadow-sm"
		>
			<div className="flex flex-wrap items-start gap-3 border-b border-border bg-muted/40 px-4 py-3 sm:flex-nowrap sm:items-center sm:justify-between">
				<CollapsibleTrigger asChild>
					<button
						type="button"
						className="flex min-w-0 flex-1 items-start gap-2 text-left transition-colors hover:bg-muted/50 data-[state=open]:[&>svg:first-child]:rotate-180 sm:items-center"
					>
						<ChevronDown
							className="mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform sm:mt-0"
							aria-hidden
						/>
						<span className="min-w-0 space-y-0.5">
							<span className="block font-semibold text-foreground">
								{getComplianceListItemCategoryLabel(category.categoryKey)}
							</span>
							<span className="block text-sm text-muted-foreground">
								{complete}/{total} complete
							</span>
						</span>
					</button>
				</CollapsibleTrigger>
				<div className="flex shrink-0 items-center gap-3 pl-7 sm:pl-0">
					<span className="text-sm text-muted-foreground">
						{total} {total === 1 ? "item" : "items"}
					</span>
					{!vendorMode && (
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={onCategoryUploadClick}
						>
							<Upload className="size-3.5" aria-hidden />
							Upload
						</Button>
					)}
				</div>
			</div>
			<CollapsibleContent>
				<div className="grid grid-cols-1 gap-4 bg-background p-4 sm:grid-cols-2">
					{category.items.map((req) => (
						<DocumentRequirementCard
							key={req.complianceListItemId}
							requirement={req}
							audience={vendorMode ? "vendor" : "candidate"}
							onUploadClick={() => onUploadItem(req)}
							onReplaceClick={() => onReplaceItem(req)}
							onDownloadClick={() => onDownloadItem(req)}
							onViewClick={() => onViewItem(req)}
							onApproveClick={
								onApproveItem ? () => onApproveItem(req) : undefined
							}
							onRejectClick={onRejectItem ? () => onRejectItem(req) : undefined}
							isReviewActionPending={
								reviewActionPendingForId === req.complianceListItemId
							}
						/>
					))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

function DocumentWalletCategoryCollapsibleMock({
	category,
	audience = "candidate",
	onUploadClick,
}: DocumentWalletCategoryCollapsibleMockProps) {
	const isVendor = audience === "vendor";
	const approved = getCategoryApprovedCount(category);
	const total = category.items.length;
	const progressLabel = isVendor ? "approved" : "complete";

	return (
		<Collapsible
			defaultOpen
			className="bg-card overflow-hidden rounded-lg border shadow-sm"
		>
			<div className="border-border bg-muted/40 flex flex-wrap items-start gap-3 border-b px-4 py-3 sm:flex-nowrap sm:items-center sm:justify-between">
				<CollapsibleTrigger asChild>
					<button
						type="button"
						className="hover:bg-muted/50 flex min-w-0 flex-1 items-start gap-2 text-left transition-colors data-[state=open]:[&>svg:first-child]:rotate-180 sm:items-center"
					>
						<ChevronDown
							className="text-muted-foreground mt-0.5 size-5 shrink-0 transition-transform sm:mt-0"
							aria-hidden
						/>
						<span className="min-w-0 space-y-0.5">
							<span className="text-foreground block font-semibold">
								{category.label}
							</span>
							<span className="text-muted-foreground block text-sm">
								{approved}/{total} {progressLabel}
							</span>
						</span>
					</button>
				</CollapsibleTrigger>
				<div className="flex shrink-0 items-center gap-3 pl-7 sm:pl-0">
					<span className="text-muted-foreground text-sm">
						{total} {total === 1 ? "item" : "items"}
					</span>
					{!isVendor && (
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={onUploadClick}
						>
							<Upload className="size-3.5" aria-hidden />
							Upload
						</Button>
					)}
				</div>
			</div>
			<CollapsibleContent>
				<div className="bg-background grid gap-4 p-4 sm:grid-cols-2">
					{category.items.map((req) => (
						<DocumentRequirementCard
							key={req.id}
							audience={audience}
							requirement={req}
							onUploadClick={onUploadClick}
							onReplaceClick={onUploadClick}
							onDownloadClick={() =>
								toast.info("Download document", {
									description: `"${req.title}" — mock only; no file is downloaded.`,
								})
							}
							onViewClick={() =>
								toast.info("View document", {
									description: `"${req.title}" — mock preview.`,
								})
							}
							onApproveClick={() =>
								toast.success("Approved", {
									description: `"${req.title}" — mock action only.`,
								})
							}
							onRejectClick={() =>
								toast.message("Rejected", {
									description: `"${req.title}" — mock action only.`,
								})
							}
							onDeleteClick={() =>
								toast.message("Delete", {
									description: `"${req.title}" — mock action only.`,
								})
							}
						/>
					))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
