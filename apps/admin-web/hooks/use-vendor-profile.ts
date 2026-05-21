import { useForm } from "@tanstack/react-form";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type {
	useCreateVendorMutation,
	useUpdateVendorMutation,
} from "@/queries/vendor.queries";
import { vendorProfileSchema } from "@/schemas/vendor.schema";
import type { VendorDetail } from "@/types/vendor";

export interface UseVendorProfileReturn {
	form: ReturnType<typeof useForm>;
	isSubmitting: boolean;
	logoFile: File | null;
	logoPreview: string | null;
	setLogoFile: (file: File | null) => void;
	setLogoPreview: (url: string | null) => void;
}

function generateInternalId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(4));
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0"))
		.join("")
		.toUpperCase();
}

interface UseVendorProfileOptions {
	vendor: VendorDetail | null;
	isEditing: boolean;
	vendorId: string | null;
	createMutation: ReturnType<typeof useCreateVendorMutation>;
	updateMutation: ReturnType<typeof useUpdateVendorMutation>;
	router: AppRouterInstance;
}

export function useVendorProfile({
	vendor,
	isEditing,
	vendorId,
	createMutation,
	updateMutation,
	router,
}: UseVendorProfileOptions) {
	const generatedInternalId = useMemo(() => generateInternalId(), []);
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);

	const form = useForm({
		validators: { onSubmit: vendorProfileSchema },
		defaultValues: {
			logoUrl: vendor?.logo ?? "",
			name: vendor?.name ?? "",
			industries: (vendor?.industries ?? []) as string[],
			certifiedBusinessClassifications:
				(vendor?.certifiedBusinessClassifications ?? []) as string[],
			about: vendor?.about ?? "",
			isActive: vendor?.isActive ?? true,
			internalId: vendor?.internalId ?? generatedInternalId,
			createdDate: vendor?.createdAt
				? new Date(vendor.createdAt).toISOString()
				: new Date().toISOString(),
			taxId: vendor?.taxId ?? "",
			phoneNumber: vendor?.phoneNumber ?? "",
			website: vendor?.website ?? "",
			addressStreet: vendor?.address?.street ?? "",
			addressCity: vendor?.address?.city ?? "",
			addressState: vendor?.address?.state ?? "",
			addressZipCode: vendor?.address?.zipCode ?? "",
			addressCountry: vendor?.address?.country ?? "",
			annualRevenue: vendor?.annualRevenue ?? null,
			employeeCount: vendor?.employeeCount ?? null,
		},
		onSubmitInvalid: () => {
			toast.error("Please fill in all required fields");
		},
		onSubmit: ({ value }) => {
			const street = value.addressStreet?.trim() ?? "";
			const city = value.addressCity?.trim() ?? "";
			const state = value.addressState?.trim() ?? "";
			const zipCode = value.addressZipCode?.trim() ?? "";
			const country = value.addressCountry?.trim() ?? "";
			const address =
				street && city && state && zipCode
					? { street, city, state, zipCode, country: country || "USA" }
					: undefined;

			const payload = {
				name: value.name,
				industries: value.industries,
				certifiedBusinessClassifications:
					value.certifiedBusinessClassifications,
				about: value.about || undefined,
				isActive: value.isActive,
				internalId: value.internalId,
				...(logoFile ? {} : { logoUrl: value.logoUrl || undefined }),
				taxId: value.taxId || undefined,
				phoneNumber: value.phoneNumber || undefined,
				website: value.website || undefined,
				address,
				annualRevenue: value.annualRevenue,
				employeeCount: value.employeeCount,
			};

			const mutationOptions = {
				onSuccess: (created: { id: string }) => {
					toast.success(
						isEditing ? "Vendor profile updated" : "Vendor profile created",
					);
					router.push(
						`/vendors/create?step=1&vendorId=${isEditing ? vendorId : created.id}`,
					);
				},
				onError: (err: unknown) =>
					toast.error(
						err instanceof Error
							? err.message
							: "Failed to save vendor profile",
					),
			};

			if (isEditing && vendorId) {
				updateMutation.mutate(
					{
						id: vendorId,
						payload,
						logoFile: logoFile ?? undefined,
					},
					mutationOptions,
				);
			} else {
				createMutation.mutate(
					{ payload, logoFile: logoFile ?? undefined },
					mutationOptions,
				);
			}
		},
	});

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	return {
		form,
		isSubmitting,
		logoFile,
		logoPreview,
		setLogoFile,
		setLogoPreview,
	};
}

export type VendorProfileApi = ReturnType<typeof useVendorProfile>["form"];
