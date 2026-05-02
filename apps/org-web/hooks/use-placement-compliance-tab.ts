import { useState } from "react";
import { toast } from "sonner";
import { useOrgContext } from "@/contexts/org-context";
import {
	useAddPlacementComplianceItems,
	usePlacementCompliance,
	useRemovePlacementComplianceItem,
} from "@/queries/placements.queries";

export function usePlacementComplianceTab(placementId: string) {
	const { id: orgId } = useOrgContext();

	const complianceQuery = usePlacementCompliance(orgId, placementId);
	const addItems = useAddPlacementComplianceItems(orgId, placementId);
	const removeItem = useRemovePlacementComplianceItem(orgId, placementId);

	const [addDialogOpen, setAddDialogOpen] = useState(false);
	const [expandedAuditItemId, setExpandedAuditItemId] = useState<string | null>(
		null,
	);

	const summary = complianceQuery.data?.summary;
	const categories = complianceQuery.data?.categories ?? [];

	const toggleAuditLog = (complianceListItemId: string) => {
		setExpandedAuditItemId((prev) =>
			prev === complianceListItemId ? null : complianceListItemId,
		);
	};

	const handleRemove = (complianceListItemId: string) => {
		removeItem.mutate(complianceListItemId, {
			onSuccess: () => toast.success("Requirement removed from placement"),
			onError: (err) =>
				toast.error(
					err instanceof Error ? err.message : "Could not remove item",
				),
		});
	};

	const handleAddSelected = (complianceListItemIds: string[]) => {
		if (complianceListItemIds.length === 0) return;
		addItems.mutate(complianceListItemIds, {
			onSuccess: () => {
				toast.success(
					complianceListItemIds.length === 1
						? "Compliance requirement added"
						: `${complianceListItemIds.length} requirements added`,
				);
				setAddDialogOpen(false);
			},
			onError: (err) =>
				toast.error(
					err instanceof Error ? err.message : "Could not add requirements",
				),
		});
	};

	return {
		orgId,
		isLoading: complianceQuery.isPending,
		error: complianceQuery.error,
		total: summary?.total ?? 0,
		complete: summary?.complete ?? 0,
		missing: summary?.missing ?? 0,
		expired: summary?.expired ?? 0,
		pending: summary?.pending ?? 0,
		categories,
		addDialogOpen,
		setAddDialogOpen,
		expandedAuditItemId,
		toggleAuditLog,
		handleRemove,
		handleAddSelected,
		isAddPending: addItems.isPending,
	};
}
