"use client";

import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import type { VendorTableRowType } from "@/types/vendor";

interface VendorDeleteDialogProps {
	vendor: VendorTableRowType | null;
	isPending: boolean;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

export function VendorDeleteDialog({
	vendor,
	isPending,
	onConfirm,
	onOpenChange,
}: Readonly<VendorDeleteDialogProps>) {
	return (
		<CustomAlertDialog
			isOpen={!!vendor}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete Vendor"
			description={`Are you sure you want to delete ${vendor?.name}? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete Vendor"}
		/>
	);
}
