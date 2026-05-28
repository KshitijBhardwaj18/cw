import { useState } from "react";
import { toast } from "sonner";
import { useEndPlacement } from "@/queries/placements.queries";

export function usePlacementCardActions(
	placementId: string,
	placementNumber: string,
) {
	const [endDialogOpen, setEndDialogOpen] = useState(false);
	const endPlacement = useEndPlacement();

	const handleEndConfirm = (terminationReason?: string): Promise<void> => {
		return new Promise<void>((resolve, reject) => {
			endPlacement.mutate(
				{ placementId, body: { terminationReason } },
				{
					onSuccess: () => {
						toast.success(`Placement ${placementNumber} ended`);
						setEndDialogOpen(false);
						resolve();
					},
					onError: (err) => {
						console.error("[endPlacement] failed", {
							placementId,
							error: err,
						});
						toast.error(
							err instanceof Error ? err.message : "Could not end placement",
						);
						reject(err);
					},
				},
			);
		});
	};

	return {
		endDialogOpen,
		setEndDialogOpen,
		handleEndConfirm,
		isEndPending: endPlacement.isPending,
	};
}
