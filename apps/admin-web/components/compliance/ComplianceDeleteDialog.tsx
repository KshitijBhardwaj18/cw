"use client";

import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import type { ComplianceTableRowType } from "@/types/compliance";

interface ComplianceDeleteDialogProps {
	item: ComplianceTableRowType | null;
	isPending: boolean;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

export function ComplianceDeleteDialog({
	item,
	isPending,
	onConfirm,
	onOpenChange,
}: Readonly<ComplianceDeleteDialogProps>) {
	return (
		<CustomAlertDialog
			isOpen={!!item}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete Compliance Item"
			description={`Are you sure you want to delete "${item?.name}"? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete Compliance Item"}
		/>
	);
}
