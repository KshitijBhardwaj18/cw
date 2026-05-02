"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import { Banner } from "@repo/ui/general/Banner";
import { DEFAULT_DISPUTE_WINDOW_DAYS } from "@/constants/timekeeping";

export function TimekeepingConfigurationCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Timekeeping Configuration</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<FieldGroup>
					<Field orientation="horizontal" className="justify-start gap-4">
						<Switch id="vendor-approval" />
						<FieldLabel htmlFor="vendor-approval">
							Timekeeping is also approved by the vendor.
						</FieldLabel>
					</Field>

					<Field>
						<FieldLabel>Dispute Window Setting (Days)</FieldLabel>
						<Input
							type="number"
							placeholder="Enter days..."
							defaultValue={DEFAULT_DISPUTE_WINDOW_DAYS}
						/>
					</Field>
				</FieldGroup>

				<Banner
					variant="info"
					size="sm"
					icon={<span className="hidden" />}
					title="Note"
					description="If you do not dispute the time approval within the dispute window, it will be approved automatically."
					tintedText
				/>
			</CardContent>
		</Card>
	);
}
