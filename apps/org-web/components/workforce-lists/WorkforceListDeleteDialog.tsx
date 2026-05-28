"use client";

import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import type { WorkforceListCardItem } from "@/types/workforce-list";

type WorkforceListDeleteDialogProps = {
	list: WorkforceListCardItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isPending?: boolean;
};

export function WorkforceListDeleteDialog({
	list,
	open,
	onOpenChange,
	onConfirm,
	isPending = false,
}: Readonly<WorkforceListDeleteDialogProps>) {
	return (
		<CustomAlertDialog
			isOpen={open && !!list}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete Workforce List"
			description={`Are you sure you want to delete "${list?.name}"? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete List"}
		/>
	);
}
