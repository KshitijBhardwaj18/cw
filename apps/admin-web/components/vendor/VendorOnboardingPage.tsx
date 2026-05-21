"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useCallback } from "react";
import { DocumentsStep } from "./steps/documentation/DocumentsStep";
import { NotesStep } from "./steps/note/NotesStep";
import { OccupationsStep } from "./steps/occupation/OccupationsStep";
import { VendorProfileStep } from "./steps/vendorProfile/VendorProfileStep";
import { VendorUsersStep } from "./steps/vendorUser/VendorUsersStep";
import { VendorProgressBar } from "./VendorProgressBar";

export function VendorOnboardingPage() {
	const [params, setParams] = useQueryStates({
		step: parseAsInteger.withDefault(0),
		vendorId: parseAsString.withDefault(""),
	});

	const currentStep = Math.min(Math.max(params.step, 0), 4);
	const vendorId = params.vendorId;

	const handleStepChange = useCallback(
		(step: number) => {
			setParams({ step });
		},
		[setParams],
	);

	return (
		<div className="flex flex-col gap-8">
			<PageBackLink href="/vendors">Back to Vendors</PageBackLink>

			<Card>
				<CardContent>
					<VendorProgressBar
						currentStep={currentStep}
						vendorId={vendorId}
						onStepChange={handleStepChange}
					/>
				</CardContent>
			</Card>

			{currentStep === 0 && <VendorProfileStep vendorId={vendorId} />}
			{currentStep === 1 && <OccupationsStep vendorId={vendorId} />}
			{currentStep === 2 && <VendorUsersStep vendorId={vendorId} />}
			{currentStep === 3 && <DocumentsStep vendorId={vendorId} />}
			{currentStep === 4 && <NotesStep vendorId={vendorId} />}
		</div>
	);
}
