"use client";

import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";

interface ChecklistTemplateDeleteDialogProps {
	checklistName: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isPending?: boolean;
}

export function ChecklistTemplateDeleteDialog({
	checklistName,
	open,
	onOpenChange,
	onConfirm,
	isPending = false,
}: ChecklistTemplateDeleteDialogProps) {
	return (
		<CustomAlertDialog
			isOpen={open && !!checklistName}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete Checklist Template"
			description={`Are you sure you want to delete "${checklistName}"? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete Template"}
		/>
	);
}
