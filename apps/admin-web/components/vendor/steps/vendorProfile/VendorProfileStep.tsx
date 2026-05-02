"use client";

import { useRouter } from "next/navigation";
import {
	useCreateVendorMutation,
	useUpdateVendorMutation,
	useVendorDetailQuery,
} from "@/queries/vendor.queries";
import { VendorProfileForm } from "./VendorProfileForm";

interface VendorProfileStepProps {
	vendorId: string | null;
}

export function VendorProfileStep({ vendorId }: VendorProfileStepProps) {
	const router = useRouter();
	const { data: vendor } = useVendorDetailQuery(vendorId);
	const createMutation = useCreateVendorMutation();
	const updateMutation = useUpdateVendorMutation();

	const isEditing = !!vendorId;

	return (
		<VendorProfileForm
			vendor={vendor ?? null}
			isEditing={isEditing}
			vendorId={vendorId}
			createMutation={createMutation}
			updateMutation={updateMutation}
			router={router}
		/>
	);
}
