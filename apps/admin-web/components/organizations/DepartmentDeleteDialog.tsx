"use client";

import type { OrganizationDepartmentType } from "@repo/shared";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";

interface DepartmentDeleteDialogProps {
	department: OrganizationDepartmentType | null;
	isPending: boolean;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

export function DepartmentDeleteDialog({
	department,
	isPending,
	onConfirm,
	onOpenChange,
}: DepartmentDeleteDialogProps) {
	return (
		<CustomAlertDialog
			isOpen={!!department}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete Department"
			description={`Are you sure you want to delete "${department?.name}"? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete Department"}
		/>
	);
}
