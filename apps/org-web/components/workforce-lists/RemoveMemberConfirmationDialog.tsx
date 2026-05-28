"use client";

import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";

type RemoveMemberConfirmationDialogProps = {
	memberName: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isPending?: boolean;
};

export function RemoveMemberConfirmationDialog({
	memberName,
	open,
	onOpenChange,
	onConfirm,
	isPending = false,
}: Readonly<RemoveMemberConfirmationDialogProps>) {
	return (
		<CustomAlertDialog
			isOpen={open && !!memberName}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Remove Member from List"
			description={`Are you sure you want to remove "${memberName}" from this list? They will still be part of the workforce.`}
			cancelText="Cancel"
			confirmText={isPending ? "Removing..." : "Remove Member"}
		/>
	);
}
