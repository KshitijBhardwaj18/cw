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
import { usePlacementComplianceTab } from "@/hooks/use-placement-compliance-tab";
import { AddComplianceItemDialog } from "./AddComplianceItemDialog";
import { ComplianceCategorySection } from "./ComplianceCategorySection";
import { ComplianceStatusCard } from "./ComplianceStatusCard";

interface PlacementComplianceTabContentProps {
	placementId: string;
	mode: "org" | "vendor";
}

export function PlacementComplianceTabContent({
	placementId: _placementId,
	mode = "org",
}: PlacementComplianceTabContentProps) {
	const ability = useAbility();
	const canAddPlacementComplianceItems =
		mode === "org" && ability.can(Action.Update, "PlacementComplianceItem");
	const canRemovePlacementExtras =
		mode === "org" && ability.can(Action.Delete, "PlacementComplianceItem");

	const {
		orgId,
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
	} = usePlacementComplianceTab(_placementId);

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
						/>
					))}
				</div>
			)}

			<AddComplianceItemDialog
				open={addDialogOpen}
				onOpenChange={setAddDialogOpen}
				orgId={orgId}
				placementId={_placementId}
				onAddSelected={handleAddSelected}
				isPending={isAddPending}
			/>
		</div>
	);
}
