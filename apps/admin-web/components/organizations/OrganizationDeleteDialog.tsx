"use client";

import type { OrganizationResponseType } from "@repo/shared";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import { toast } from "sonner";
import { useDeleteOrganization } from "@/queries/organizations.query";

type OrganizationDeleteDialogProps = {
	organization: OrganizationResponseType | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function OrganizationDeleteDialog({
	organization,
	open,
	onOpenChange,
}: Readonly<OrganizationDeleteDialogProps>) {
	const deleteMutation = useDeleteOrganization();

	const handleConfirm = () => {
		if (!organization) return;
		deleteMutation.mutate(organization.id, {
			onSuccess: () => {
				toast.success("Organization deleted successfully");
				onOpenChange(false);
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Something went wrong",
				);
			},
		});
	};

	return (
		<CustomAlertDialog
			isOpen={open && !!organization}
			onClose={() => onOpenChange(false)}
			onConfirm={handleConfirm}
			isLoading={deleteMutation.isPending}
			title="Delete Organization"
			description={`Are you sure you want to delete "${organization?.name}"? This action cannot be undone.`}
			cancelText="Cancel"
			confirmText={
				deleteMutation.isPending ? "Deleting..." : "Delete Organization"
			}
		/>
	);
}
