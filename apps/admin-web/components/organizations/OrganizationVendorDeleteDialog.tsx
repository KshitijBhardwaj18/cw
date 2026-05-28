"use client";

import type { OrganizationVendorWithVendorType } from "@repo/shared";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";

type OrganizationVendorDeleteDialogProps = {
	organizationVendor: OrganizationVendorWithVendorType | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isPending: boolean;
};

export function OrganizationVendorDeleteDialog({
	organizationVendor,
	open,
	onOpenChange,
	onConfirm,
	isPending,
}: Readonly<OrganizationVendorDeleteDialogProps>) {
	const vendorName = organizationVendor?.vendor.name ?? "this vendor";

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove vendor</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to remove <strong>{vendorName}</strong> from
						this organization? This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isPending ? "Removing..." : "Remove"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
