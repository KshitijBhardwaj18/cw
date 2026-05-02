"use client";

import { useRouter } from "next/navigation";
import { VendorUserForm } from "./VendorUserForm";
import { VendorUsersList } from "./VendorUsersList";
import { VendorUsersStepFooter } from "./VendorUsersStepFooter";

interface VendorUsersStepProps {
	vendorId: string;
}

export function VendorUsersStep({ vendorId }: VendorUsersStepProps) {
	const router = useRouter();

	const handleNext = () => {
		router.push(`/vendors/create?step=3&vendorId=${vendorId}`);
	};

	const handleBack = () => {
		router.push(`/vendors/create?step=1&vendorId=${vendorId}`);
	};

	return (
		<div className="space-y-6">
			<VendorUserForm vendorId={vendorId} />
			<VendorUsersList vendorId={vendorId} />
			<VendorUsersStepFooter onBack={handleBack} onNext={handleNext} />
		</div>
	);
}
