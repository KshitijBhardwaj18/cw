"use client";

import { Button } from "@repo/ui/components/button";
import { Plus } from "lucide-react";
import type { LocationBlockForm } from "./LocationBlock";
import { LocationBlock } from "./LocationBlock";

type LocationFormValues = {
	locationName: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	locationType: string;
	phone: string;
	email: string;
	costCenter: string;
};

export type LocationsSectionForm = {
	Field: (props: {
		name: string;
		mode?: "array";
		children: (field: {
			state: {
				value: LocationFormValues[];
				meta: { errors?: string[] };
			};
			pushValue: (value: LocationFormValues) => void;
			removeValue: (index: number) => void;
		}) => React.ReactNode;
	}) => React.ReactNode;
};

type LocationsSectionProps = {
	form: LocationsSectionForm & LocationBlockForm;
	defaultLocation: LocationFormValues;
	isPending?: boolean;
};

export function LocationsSection({
	form,
	defaultLocation,
	isPending = false,
}: Readonly<LocationsSectionProps>) {
	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h3 className="text-base font-semibold">
					Locations (at least one required)
				</h3>
				<form.Field name="locations" mode="array">
					{(field) => (
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={isPending}
							onClick={() => field.pushValue({ ...defaultLocation })}
						>
							<Plus className="size-4" data-icon="inline-start" />
							Add Location
						</Button>
					)}
				</form.Field>
			</div>

			<form.Field name="locations" mode="array">
				{(field) => (
					<>
						{field.state.meta.errors?.length ? (
							<p className="text-destructive text-sm">
								{field.state.meta.errors.join(", ")}
							</p>
						) : null}
						{field.state.value.map((_, index) => (
							<LocationBlock
								key={index}
								form={form as LocationBlockForm}
								index={index}
								onRemove={() => field.removeValue(index)}
								canRemove={field.state.value.length > 1}
								isPending={isPending}
							/>
						))}
					</>
				)}
			</form.Field>
		</div>
	);
}
