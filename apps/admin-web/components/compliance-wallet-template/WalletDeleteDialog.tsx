"use client";

import type { CombinationRow } from "@repo/shared";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";

interface WalletDeleteDialogProps {
	row: CombinationRow | null;
	isPending: boolean;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

export function WalletDeleteDialog({
	row,
	isPending,
	onConfirm,
	onOpenChange,
}: WalletDeleteDialogProps) {
	const label =
		row != null
			? `${row.occupation.name}${row.specialty ? ` - ${row.specialty.name}` : ""}`
			: "";

	return (
		<CustomAlertDialog
			isOpen={!!row}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Clear Compliance Wallet"
			description={`Are you sure you want to remove all items from the compliance wallet for "${label}"? The wallet will be empty. This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Clearing..." : "Remove All Items"}
		/>
	);
}
