"use client";

import type { SpecialtyTableRowType } from "@repo/shared";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";

interface SpecialtyDeleteDialogProps {
	specialty: SpecialtyTableRowType | null;
	isPending: boolean;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

export function SpecialtyDeleteDialog({
	specialty,
	isPending,
	onConfirm,
	onOpenChange,
}: Readonly<SpecialtyDeleteDialogProps>) {
	return (
		<CustomAlertDialog
			isOpen={!!specialty}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete Specialty"
			description={`Are you sure you want to delete ${specialty?.acronym} — ${specialty?.name}? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete Specialty"}
		/>
	);
}
