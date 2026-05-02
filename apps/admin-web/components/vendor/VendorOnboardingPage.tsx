"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { useSearchParams } from "next/navigation";
import { DocumentsStep } from "./steps/documentation/DocumentsStep";
import { NotesStep } from "./steps/note/NotesStep";
import { OccupationsStep } from "./steps/occupation/OccupationsStep";
import { VendorProfileStep } from "./steps/vendorProfile/VendorProfileStep";
import { VendorUsersStep } from "./steps/vendorUser/VendorUsersStep";
import { VendorProgressBar } from "./VendorProgressBar";

export function VendorOnboardingPage() {
	const searchParams = useSearchParams();
	const currentStep = Number(searchParams.get("step") ?? 0);
	const vendorId = searchParams.get("vendorId");
	const vendorIdOrEmpty = vendorId ?? "";

	return (
		<div className="flex flex-col gap-8">
			<Card>
				<CardContent>
					<VendorProgressBar
						currentStep={currentStep}
						vendorId={vendorIdOrEmpty}
					/>
				</CardContent>
			</Card>

			{currentStep === 0 && <VendorProfileStep vendorId={vendorIdOrEmpty} />}
			{currentStep === 1 && <OccupationsStep vendorId={vendorIdOrEmpty} />}
			{currentStep === 2 && <VendorUsersStep vendorId={vendorIdOrEmpty} />}
			{currentStep === 3 && <DocumentsStep vendorId={vendorIdOrEmpty} />}
			{currentStep === 4 && <NotesStep vendorId={vendorIdOrEmpty} />}
		</div>
	);
}
