import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import LoadingButton from "@repo/ui/general/LoadingButton";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import type {
	useCreateVendorMutation,
	useUpdateVendorMutation,
} from "@/queries/vendor.queries";
import type { VendorDetail } from "@/types/vendor";
import { VendorProfileLeftFields } from "./VendorProfileLeftFields";
import { VendorProfileRightFields } from "./VendorProfileRightFields";

interface VendorProfileFormProps {
	vendor: VendorDetail | null;
	isEditing: boolean;
	vendorId: string | null;
	createMutation: ReturnType<typeof useCreateVendorMutation>;
	updateMutation: ReturnType<typeof useUpdateVendorMutation>;
	router: AppRouterInstance;
}

export function VendorProfileForm({
	vendor,
	isEditing,
	vendorId,
	createMutation,
	updateMutation,
	router,
}: VendorProfileFormProps) {
	const {
		form,
		isSubmitting,
		logoFile,
		logoPreview,
		setLogoFile,
		setLogoPreview,
	} = useVendorProfile({
		vendor,
		isEditing,
		vendorId,
		createMutation,
		updateMutation,
		router,
	});

	return (
		<Card>
			<CardContent className="p-6">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<VendorProfileLeftFields
							form={form}
							logoFile={logoFile}
							logoPreview={logoPreview}
							setLogoFile={setLogoFile}
							setLogoPreview={setLogoPreview}
						/>
						<VendorProfileRightFields form={form} />
					</div>

					<div className="mt-8 flex items-center justify-between border-t pt-6">
						<Button type="button" variant="outline" disabled>
							Back
						</Button>
						<div className="flex gap-3">
							<Button
								type="button"
								variant="ghost"
								onClick={() => router.push("/vendors")}
							>
								Cancel
							</Button>
							<LoadingButton type="submit" isLoading={isSubmitting}>
								Save & Continue
							</LoadingButton>
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
