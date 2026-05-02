"use client";

import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import type { ShiftTemplateListItem } from "@/types/shift-template";

type ShiftTemplateDeleteDialogProps = {
	template: ShiftTemplateListItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isDeleting?: boolean;
};

export function ShiftTemplateDeleteDialog({
	template,
	open,
	onOpenChange,
	onConfirm,
	isDeleting = false,
}: ShiftTemplateDeleteDialogProps) {
	return (
		<CustomAlertDialog
			isOpen={open && !!template}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isDeleting}
			title="Delete Shift Template"
			description={`Are you sure you want to delete "${template?.templateName}"? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isDeleting ? "Deleting..." : "Delete Template"}
		/>
	);
}
