"use client";

import type { OccupationTableRowType } from "@repo/shared";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";

interface OccupationDeleteDialogProps {
	occupation: OccupationTableRowType | null;
	isPending: boolean;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

export function OccupationDeleteDialog({
	occupation,
	isPending,
	onConfirm,
	onOpenChange,
}: OccupationDeleteDialogProps) {
	return (
		<CustomAlertDialog
			isOpen={!!occupation}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete Occupation"
			description={`Are you sure you want to delete ${occupation?.name}? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete Occupation"}
		/>
	);
}
