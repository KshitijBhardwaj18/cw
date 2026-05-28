"use client";

import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import type { OrganizationOccupationTableRowType } from "@/types/organization-occupation";

interface OrganizationOccupationUnlinkDialogProps {
	occupation: OrganizationOccupationTableRowType | null;
	isPending: boolean;
	onConfirm: () => void;
	onOpenChange: (open: boolean) => void;
}

export function OrganizationOccupationUnlinkDialog({
	occupation,
	isPending,
	onConfirm,
	onOpenChange,
}: Readonly<OrganizationOccupationUnlinkDialogProps>) {
	return (
		<CustomAlertDialog
			isOpen={!!occupation}
			onClose={() => onOpenChange(false)}
			onConfirm={onConfirm}
			isLoading={isPending}
			title="Unlink occupation from organization"
			description={`Are you sure you want to unlink "${occupation?.name}" from this organization? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={isPending ? "Unlinking..." : "Unlink from organization"}
		/>
	);
}
