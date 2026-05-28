"use client";

import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import type { VendorDocumentWithUser } from "@/types/vendor";

interface DocumentDeleteDialogProps {
	document: VendorDocumentWithUser | null;
	isPending: boolean;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

export function DocumentDeleteDialog({
	document,
	isPending,
	onConfirm,
	onOpenChange,
}: Readonly<DocumentDeleteDialogProps>) {
	return (
		<CustomAlertDialog
			isOpen={!!document}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete Document"
			description={`Are you sure you want to delete "${document?.name}"? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete Document"}
		/>
	);
}
