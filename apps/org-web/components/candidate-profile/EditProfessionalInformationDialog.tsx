"use client";

import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import { Field, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@repo/ui/components/multi-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { useForm } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateCandidateProfile } from "@/queries/candidate-profile.queries";
import {
	useLocationsForOrg,
	useOccupationsForOrg,
	useSpecialtiesForOccupationInOrg,
} from "@/queries/candidates.queries";
import {
	editProfessionalInformationSchema,
	type ProfessionalFormValues,
} from "@/schemas/candidate-profile.schema";
import type { CandidateMeOnboarding } from "@/services/onboarding.service";

const SHIFT_TYPE_OPTIONS = [
	"Day Shift",
	"Night Shift",
	"Rotating Shift",
	"Flexible",
];

export type EditProfessionalInformationDialogProps = {
	profile: CandidateMeOnboarding;
	onSuccess: () => void;
	trigger: React.ReactNode;
};

function buildDefaultValues(
	profile: CandidateMeOnboarding,
): ProfessionalFormValues {
	return {
		occupationId: profile.occupationId ?? "",
		specialtyIds: profile.specialtyIds ?? [],
		locationIds: profile.locationIds ?? [],
		yearsOfExperience: profile.yearsOfExperience ?? undefined,
		preferredShiftTypes: profile.preferredShiftTypes ?? [],
		willingToRelocate: profile.willingToRelocate ?? false,
	};
}

export function EditProfessionalInformationDialog({
	profile,
	onSuccess,
	trigger,
}: EditProfessionalInformationDialogProps) {
	const [open, setOpen] = useState(false);
	const [selectedOccupationId, setSelectedOccupationId] = useState(
		profile.occupationId ?? "",
	);
	const updateMutation = useUpdateCandidateProfile();

	const occupationsQuery = useOccupationsForOrg(
		open ? profile.organizationId : undefined,
	);
	const specialtiesQuery = useSpecialtiesForOccupationInOrg(
		open ? profile.organizationId : undefined,
		open ? selectedOccupationId : undefined,
	);
	const locationsQuery = useLocationsForOrg(
		open ? profile.organizationId : undefined,
	);

	const form = useForm({
		defaultValues: buildDefaultValues(profile),
		validators: {
			onSubmit: editProfessionalInformationSchema,
		},
		onSubmit: async ({ value }) => {
			await new Promise<void>((resolve, reject) => {
				updateMutation.mutate(
					{
						occupationId: value.occupationId,
						specialtyIds: value.specialtyIds,
						locationIds: value.locationIds,
						yearsOfExperience: value.yearsOfExperience ?? null,
						preferredShiftTypes: value.preferredShiftTypes,
						willingToRelocate: value.willingToRelocate,
					},
					{
						onSuccess: () => {
							toast.success("Professional information updated");
							setOpen(false);
							onSuccess();
							resolve();
						},
						onError: (err) => {
							toast.error(
								err instanceof Error
									? err.message
									: "Failed to update professional information",
							);
							reject(err);
						},
					},
				);
			});
		},
	});

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) {
			form.reset(buildDefaultValues(profile));
			setSelectedOccupationId(profile.occupationId ?? "");
		}
		setOpen(nextOpen);
	};

	const specialtyRows = specialtiesQuery.data ?? [];

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Professional Information</DialogTitle>
					<DialogDescription>
						Update your professional background and preferences.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="space-y-4 mt-4"
				>
					<form.Field name="occupationId">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>
									Occupation <RequiredStar />
								</FieldLabel>
								<Select
									value={field.state.value}
									onValueChange={(val) => {
										field.handleChange(val);
										setSelectedOccupationId(val);
										form.setFieldValue("specialtyIds", []);
									}}
								>
									<SelectTrigger id={field.name}>
										<SelectValue placeholder="Select occupation" />
									</SelectTrigger>
									<SelectContent>
										{(occupationsQuery.data?.data ?? []).map((occ) => (
											<SelectItem key={occ.id} value={occ.id}>
												{occ.name}
												{occ.acronym ? ` (${occ.acronym})` : ""}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						)}
					</form.Field>

					<form.Field name="specialtyIds">
						{(field) => (
							<Field>
								<FieldLabel>Specialties</FieldLabel>
								<div
									className={
										!selectedOccupationId || specialtiesQuery.isLoading
											? "pointer-events-none opacity-50"
											: undefined
									}
								>
									<MultiSelect
										values={field.state.value}
										onValuesChange={field.handleChange}
									>
										<MultiSelectTrigger className="w-full">
											<MultiSelectValue placeholder="Select specialties" />
										</MultiSelectTrigger>
										<MultiSelectContent
											search={{
												placeholder: "Search specialties...",
												emptyMessage: "No specialties match your search.",
											}}
										>
											{specialtiesQuery.isLoading ? (
												<p className="px-2 py-6 text-center text-sm text-muted-foreground">
													Loading specialties…
												</p>
											) : !selectedOccupationId ? (
												<p className="px-2 py-6 text-center text-sm text-muted-foreground">
													Select an occupation first.
												</p>
											) : specialtyRows.length === 0 ? (
												<p className="px-2 py-6 text-center text-sm text-muted-foreground">
													No specialties are linked to this occupation.
												</p>
											) : (
												specialtyRows.map((spec) => (
													<MultiSelectItem key={spec.id} value={spec.id}>
														{spec.name}
														{spec.acronym ? ` (${spec.acronym})` : ""}
													</MultiSelectItem>
												))
											)}
										</MultiSelectContent>
									</MultiSelect>
								</div>
							</Field>
						)}
					</form.Field>

					<form.Field name="yearsOfExperience">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>
									Years of Experience
								</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									type="number"
									min={0}
									max={50}
									value={field.state.value ?? ""}
									onBlur={field.handleBlur}
									onChange={(e) =>
										field.handleChange(
											e.target.value === ""
												? undefined
												: Number(e.target.value),
										)
									}
									placeholder="e.g. 5"
								/>
							</Field>
						)}
					</form.Field>

					<form.Field name="preferredShiftTypes">
						{(field) => (
							<Field>
								<FieldLabel>Preferred Shift Types</FieldLabel>
								<MultiSelect
									values={field.state.value}
									onValuesChange={field.handleChange}
								>
									<MultiSelectTrigger className="w-full">
										<MultiSelectValue placeholder="Select shift types" />
									</MultiSelectTrigger>
									<MultiSelectContent>
										{SHIFT_TYPE_OPTIONS.map((shift) => (
											<MultiSelectItem key={shift} value={shift}>
												{shift}
											</MultiSelectItem>
										))}
									</MultiSelectContent>
								</MultiSelect>
							</Field>
						)}
					</form.Field>

					<form.Field name="locationIds">
						{(field) => (
							<Field>
								<FieldLabel>Preferred Locations</FieldLabel>
								<div
									className={
										locationsQuery.isLoading
											? "pointer-events-none opacity-50"
											: undefined
									}
								>
									<MultiSelect
										values={field.state.value}
										onValuesChange={field.handleChange}
									>
										<MultiSelectTrigger className="w-full">
											<MultiSelectValue placeholder="Select locations" />
										</MultiSelectTrigger>
										<MultiSelectContent
											search={{ placeholder: "Search locations..." }}
										>
											{(locationsQuery.data ?? []).map((loc) => (
												<MultiSelectItem key={loc.id} value={loc.id}>
													{[loc.city, loc.state].filter(Boolean).join(", ") ||
														loc.name}
												</MultiSelectItem>
											))}
										</MultiSelectContent>
									</MultiSelect>
								</div>
							</Field>
						)}
					</form.Field>

					<form.Field name="willingToRelocate">
						{(field) => (
							<Field>
								<div className="flex items-center gap-2">
									<Checkbox
										id={field.name}
										checked={field.state.value}
										onCheckedChange={(checked) =>
											field.handleChange(checked === true)
										}
									/>
									<FieldLabel htmlFor={field.name} className="cursor-pointer">
										Willing to Relocate
									</FieldLabel>
								</div>
							</Field>
						)}
					</form.Field>

					<form.Subscribe
						selector={(state) => ({
							canSubmit: state.canSubmit,
							isSubmitting: state.isSubmitting,
						})}
					>
						{({ isSubmitting, canSubmit }) => (
							<DialogFooter className="pt-4">
								<Button
									type="button"
									variant="ghost"
									onClick={() => setOpen(false)}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={!canSubmit || isSubmitting}>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 size-4 animate-spin" />
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
							</DialogFooter>
						)}
					</form.Subscribe>
				</form>
			</DialogContent>
		</Dialog>
	);
}
