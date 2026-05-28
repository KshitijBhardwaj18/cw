"use client";

import { getComplianceListItemCategoryLabel } from "@repo/shared";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { ChevronDown } from "lucide-react";
import type { DocumentRequirementAudience } from "@/components/document-wallet/DocumentRequirementCard";
import { DocumentRequirementCard } from "@/components/document-wallet/DocumentRequirementCard";
import type { CandidateDocumentWalletItem } from "@/types/candidate-document-wallet";

export interface DocumentWalletCategoryCollapsibleProps {
	category: {
		categoryKey: string;
		items: CandidateDocumentWalletItem[];
	};
	onUploadItem: (item: CandidateDocumentWalletItem) => void;
	onReplaceItem: (item: CandidateDocumentWalletItem) => void;
	onViewItem: (item: CandidateDocumentWalletItem) => void;
	onDownloadItem: (item: CandidateDocumentWalletItem) => void;
	onMarkLinkItem?: (item: CandidateDocumentWalletItem) => void;
	markingLinkForId?: string | null;
	vendorMode?: boolean;
	onApproveItem?: (item: CandidateDocumentWalletItem) => void;
	onRejectItem?: (item: CandidateDocumentWalletItem) => void;
	reviewActionPendingForId?: string | null;
}

function countApproved(items: CandidateDocumentWalletItem[]): number {
	return items.filter((i) => i.status === "APPROVED").length;
}

export function DocumentWalletCategoryCollapsible({
	category,
	onUploadItem,
	onReplaceItem,
	onViewItem,
	onDownloadItem,
	onMarkLinkItem,
	markingLinkForId,
	vendorMode = false,
	onApproveItem,
	onRejectItem,
	reviewActionPendingForId,
}: Readonly<DocumentWalletCategoryCollapsibleProps>) {
	const complete = countApproved(category.items);
	const total = category.items.length;
	const audience: DocumentRequirementAudience = vendorMode
		? "vendor"
		: "candidate";

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
				<span className="text-sm text-muted-foreground">
					{total} {total === 1 ? "item" : "items"}
				</span>
			</div>
			<CollapsibleContent>
				<div className="grid grid-cols-1 gap-4 bg-background p-4 sm:grid-cols-2">
					{category.items.map((req) => (
						<DocumentRequirementCard
							key={req.complianceListItemId}
							requirement={req}
							audience={audience}
							onUploadClick={() => onUploadItem(req)}
							onReplaceClick={() => onReplaceItem(req)}
							onDownloadClick={() => onDownloadItem(req)}
							onViewClick={() => onViewItem(req)}
							onMarkLinkClick={
								onMarkLinkItem ? () => onMarkLinkItem(req) : undefined
							}
							isMarkingLink={markingLinkForId === req.complianceListItemId}
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
