import {
	type VendorUserRole,
	validateEmail,
	validatePhone,
} from "@repo/shared";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import type { useAddVendorUserMutation } from "@/queries/vendor.queries";

interface UseVendorUserFormOptions {
	vendorId: string;
	addMutation: ReturnType<typeof useAddVendorUserMutation>;
	onSuccess?: () => void;
}

export function useVendorUserForm({
	vendorId,
	addMutation,
	onSuccess,
}: UseVendorUserFormOptions) {
	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			title: "",
			email: "",
			officePhone: "",
			mobilePhone: "",
			status: "Active",
			role: "VENDOR_USER" as VendorUserRole,
		},
		onSubmit: ({ value }) => {
			addMutation.mutate(
				{
					vendorId,
					payload: {
						firstName: value.firstName,
						lastName: value.lastName,
						title: value.title,
						email: value.email,
						officePhone: value.officePhone || undefined,
						mobilePhone: value.mobilePhone || undefined,
						status: value.status,
						role: value.role,
					},
				},
				{
					onSuccess: () => {
						toast.success("User added successfully");
						form.reset();
						onSuccess?.();
					},
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Failed to add user",
						),
				},
			);
		},
	});

	return {
		form,
		isSubmitting: addMutation.isPending,
		validators: {
			email: validateEmail,
			officePhone: validatePhone,
			mobilePhone: validatePhone,
		},
	};
}

export type VendorUserFormApi = ReturnType<typeof useVendorUserForm>["form"];
