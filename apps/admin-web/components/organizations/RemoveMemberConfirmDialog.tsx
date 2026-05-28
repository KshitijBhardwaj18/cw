"use client";

import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";

interface RemoveMemberConfirmDialogProps {
	memberName: string | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isPending: boolean;
}

export function RemoveMemberConfirmDialog({
	memberName,
	isOpen,
	onOpenChange,
	onConfirm,
	isPending,
}: Readonly<RemoveMemberConfirmDialogProps>) {
	return (
		<CustomAlertDialog
			isOpen={isOpen}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Remove from organization"
			description={
				memberName
					? `Are you sure you want to remove ${memberName} from the organization?`
					: "Are you sure you want to remove this user from the organization?"
			}
			cancelText="Cancel"
			confirmText={isPending ? "Removing..." : "Remove"}
		/>
	);
}
