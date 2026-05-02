"use client";

import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";

type RemoveRequisitionConfirmationDialogProps = {
	requisitionId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isPending?: boolean;
};

export function RemoveRequisitionConfirmationDialog({
	requisitionId,
	open,
	onOpenChange,
	onConfirm,
	isPending = false,
}: RemoveRequisitionConfirmationDialogProps) {
	return (
		<CustomAlertDialog
			isOpen={open && !!requisitionId}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Remove Requisition from Project"
			description={`Are you sure you want to remove requisition "${requisitionId}" from this project?`}
			cancelText="Cancel"
			confirmText={isPending ? "Removing..." : "Remove Requisition"}
		/>
	);
}
