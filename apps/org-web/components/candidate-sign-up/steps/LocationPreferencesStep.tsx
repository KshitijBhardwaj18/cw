"use client";

import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import PaginationControls from "@repo/ui/general/PaginationControls";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { Loader2, MapPin } from "lucide-react";
import { useLocationPreferencesStepForm } from "@/hooks/candidate/use-location-preferences-step-form";
import {
	type LocationPreferencesFormValues,
	locationPreferencesSchema,
} from "@/schemas/candidate-sign-up.schema";

interface LocationPreferencesStepProps {
	defaultValues: Partial<LocationPreferencesFormValues>;
	onBack: () => void;
	onSubmit: (values: LocationPreferencesFormValues) => void;
	onValuesChange?: (values: LocationPreferencesFormValues) => void;
	orgId: string;
}

export function LocationPreferencesStep({
	defaultValues,
	onBack,
	onSubmit,
	onValuesChange,
	orgId,
}: LocationPreferencesStepProps) {
	const {
		form,
		locations,
		locationsLoading,
		currentPage,
		pageCount,
		limit,
		goToPage,
		setLimit,
	} = useLocationPreferencesStepForm({
		defaultValues,
		onSubmit,
		onValuesChange,
		orgId,
	});

	return (
		<>
			<div className="space-y-1">
				<h2 className="text-lg font-semibold">Location Preferences</h2>
				<p className="text-muted-foreground text-sm">
					Select the locations where you&apos;re willing to work
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					void form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field
					name="locationIds"
					validators={{
						onChange: locationPreferencesSchema.shape.locationIds,
					}}
				>
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel className="text-sm font-medium">
									Available Locations <RequiredStar />
								</FieldLabel>
								<p className="mb-4 text-sm text-muted-foreground">
									Select one or more locations you are willing to work at.
								</p>
								<div className="flex flex-col gap-2">
									{locationsLoading ? (
										<div className="py-6 text-center text-sm text-muted-foreground">
											Loading locations...
										</div>
									) : (locations?.length ?? 0) === 0 ? (
										<div className="py-6 text-center text-sm text-muted-foreground">
											No locations available
										</div>
									) : (
										(locations ?? []).map((loc) => {
											const inputId = `location-${loc.id}`;
											return (
												<label
													key={loc.id}
													htmlFor={inputId}
													className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50"
												>
													<Checkbox
														id={inputId}
														checked={field.state.value.includes(loc.id)}
														onCheckedChange={(checked) => {
															const next =
																checked === true
																	? [...field.state.value, loc.id]
																	: field.state.value.filter(
																			(id) => id !== loc.id,
																		);
															field.handleChange(next);
														}}
														aria-label={`Select ${loc.name}, ${loc.city}, ${loc.state}`}
													/>
													<div className="flex min-w-0 flex-1 items-start gap-2">
														<MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
														<div>
															<span className="font-medium">{loc.name}</span>
															<p className="text-sm text-muted-foreground">
																{loc.city}, {loc.state}
															</p>
														</div>
													</div>
												</label>
											);
										})
									)}
								</div>
								{pageCount > 1 ? (
									<PaginationControls
										currentPage={currentPage}
										pageCount={pageCount}
										goToPage={goToPage}
										limit={limit}
										setLimit={setLimit}
									/>
								) : null}
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<div className="flex items-center justify-between pt-6">
					<Button type="button" variant="outline" onClick={onBack}>
						Back
					</Button>
					<form.Subscribe
						selector={(state) => ({
							isSubmitting: state.isSubmitting,
							canSubmit: state.canSubmit,
						})}
					>
						{({ isSubmitting, canSubmit }) => (
							<Button type="submit" disabled={!canSubmit || isSubmitting}>
								{isSubmitting ? (
									<Loader2 className="size-4 animate-spin" />
								) : null}
								Complete Profile
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</>
	);
}
