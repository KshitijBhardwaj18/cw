"use client";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { ChevronRight, Shield } from "lucide-react";
import type {
	PlacementComplianceCategory,
	PlacementComplianceItemRow,
} from "@/types/placement-compliance";
import { ComplianceItemRow } from "./ComplianceItemRow";

interface ComplianceCategorySectionProps {
	category: PlacementComplianceCategory;
	expandedAuditItemId: string | null;
	onRemoveItem: (itemId: string) => void;
	onToggleAudit: (itemId: string) => void;
	mode: "org" | "vendor" | "candidate";
	canRemovePlacementExtras?: boolean;
	canReview?: boolean;
	canSubmit?: boolean;
	onApprove?: (item: PlacementComplianceItemRow) => void;
	onReject?: (item: PlacementComplianceItemRow) => void;
	onUpload?: (item: PlacementComplianceItemRow) => void;
	onMarkLinkSubmitted?: (item: PlacementComplianceItemRow) => void;
	pendingActionItemId?: string | null;
	markingLinkItemId?: string | null;
}

export function ComplianceCategorySection({
	category,
	expandedAuditItemId,
	onRemoveItem,
	onToggleAudit,
	mode = "org",
	canRemovePlacementExtras = false,
	canReview = false,
	canSubmit = false,
	onApprove,
	onReject,
	onUpload,
	onMarkLinkSubmitted,
	pendingActionItemId,
	markingLinkItemId,
}: Readonly<ComplianceCategorySectionProps>) {
	return (
		<Collapsible defaultOpen>
			<div className="rounded-lg border bg-card">
				<CollapsibleTrigger className="group flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50">
					<ChevronRight className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
					<Shield className="text-primary size-4 shrink-0" />
					<span className="flex-1 font-medium">{category.title}</span>
					<span className="text-muted-foreground text-sm">
						Completed {category.completed} / Total {category.total}
					</span>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="divide-y border-t">
						{category.items.map((item) => (
							<ComplianceItemRow
								key={item.complianceListItemId}
								item={item}
								isAuditExpanded={
									expandedAuditItemId === item.complianceListItemId
								}
								mode={mode}
								onRemove={onRemoveItem}
								onToggleAudit={onToggleAudit}
								canRemovePlacementExtras={canRemovePlacementExtras}
								canReview={canReview}
								canSubmit={canSubmit}
								onApprove={onApprove}
								onReject={onReject}
								onUpload={onUpload}
								onMarkLinkSubmitted={onMarkLinkSubmitted}
								pendingActionItemId={pendingActionItemId}
								markingLinkItemId={markingLinkItemId}
							/>
						))}
					</div>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}
