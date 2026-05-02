"use client";

import type { OrganizationLocationType } from "@repo/shared";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";

interface LocationDeleteDialogProps {
	location: OrganizationLocationType | null;
	isPending: boolean;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

export function LocationDeleteDialog({
	location,
	isPending,
	onConfirm,
	onOpenChange,
}: LocationDeleteDialogProps) {
	return (
		<CustomAlertDialog
			isOpen={!!location}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Delete Location"
			description={`Are you sure you want to delete "${location?.name}"? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Deleting..." : "Delete Location"}
		/>
	);
}
