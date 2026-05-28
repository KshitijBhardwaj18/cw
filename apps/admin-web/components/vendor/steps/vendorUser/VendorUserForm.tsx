"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import LoadingButton from "@repo/ui/general/LoadingButton";
import { useVendorUserForm } from "@/hooks/use-vendor-user-form";
import { useAddVendorUserMutation } from "@/queries/vendor.queries";
import { VendorUserFormFields } from "../vendorUser/VendorUserFormFields";

interface VendorUserFormProps {
	vendorId: string;
}

export function VendorUserForm({ vendorId }: Readonly<VendorUserFormProps>) {
	const addMutation = useAddVendorUserMutation();

	const { form, isSubmitting, validators } = useVendorUserForm({
		vendorId,
		addMutation,
	});

	return (
		<Card>
			<CardContent className="p-6">
				<h3 className="mb-4 text-lg font-semibold">Add Vendor User</h3>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<VendorUserFormFields form={form} validators={validators} />
					</div>

					<div className="mt-4 flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => form.reset()}
						>
							Cancel
						</Button>
						<LoadingButton type="submit" isLoading={isSubmitting}>
							Add User
						</LoadingButton>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
