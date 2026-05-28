"use client";

import type { MspResponseType } from "@repo/shared";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";

interface MspDeleteDialogProps {
	msp: MspResponseType | null;
	isPending: boolean;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

export function MspDeleteDialog({
	msp,
	isPending,
	onConfirm,
	onOpenChange,
}: Readonly<MspDeleteDialogProps>) {
	return (
		<CustomAlertDialog
			isOpen={!!msp}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete MSP"
			description={`Are you sure you want to delete ${msp?.name}? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete MSP"}
		/>
	);
}
