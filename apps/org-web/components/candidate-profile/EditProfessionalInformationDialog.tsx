"use client";

import {
	CANDIDATE_EXPERIENCE_BAND_OPTIONS,
	type CandidateExperienceBand,
} from "@repo/shared";
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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ProfessionalProfileFocus } from "@/constants/candidate/profile-edit-deep-link";
import { SHIFT_TYPE_OPTIONS } from "@/constants/shifts";
import {
	useCandidateOccupationSpecialties,
	useCandidateOrgOccupations,
} from "@/queries/candidate-org-occupations.queries";
import { useUpdateCandidateProfile } from "@/queries/candidate-profile.queries";
import { useLocationsForOrg } from "@/queries/candidates.queries";
import {
	editProfessionalInformationSchema,
	type ProfessionalFormValues,
	type ShiftTypeValue,
} from "@/schemas/candidate-profile.schema";
import type { CandidateMeOnboarding } from "@/services/onboarding.service";

export type EditProfessionalInformationDialogProps = {
	profile: CandidateMeOnboarding;
	onSuccess: () => void;
	trigger: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	/** When opening from `/profile?edit=professional&focus=…`, scroll this section into view */
	focusSection?: ProfessionalProfileFocus;
};

function buildDefaultValues(
	profile: CandidateMeOnboarding,
): ProfessionalFormValues {
	return {
		occupationId: profile.occupationId?.trim() ?? "",
		specialtyIds: profile.specialtyIds ?? [],
		locationIds: profile.locationIds ?? [],
		experienceBand: profile.totalProfessionalExperienceBand ?? null,
		preferredShiftTypes: profile.preferredShiftTypes ?? [],
		willingToRelocate: profile.willingToRelocate ?? false,
	};
}

function hasSelectedOccupation(profile: CandidateMeOnboarding): boolean {
	return Boolean(profile.occupationId?.trim());
}

function hasSelectedSpecialties(profile: CandidateMeOnboarding): boolean {
	return (profile.specialtyIds?.length ?? 0) > 0;
}

export function EditProfessionalInformationDialog({
	profile,
	onSuccess,
	trigger,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	focusSection,
}: Readonly<EditProfessionalInformationDialogProps>) {
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : internalOpen;
	const prevControlledOpenRef = useRef(false);
	const [selectedOccupationId, setSelectedOccupationId] = useState(
		profile.occupationId?.trim() ?? "",
	);
	const updateMutation = useUpdateCandidateProfile();

	const orgOccupationsQuery = useCandidateOrgOccupations({
		enabled: open && Boolean(profile.organizationId),
	});
	const occupationOptions = (orgOccupationsQuery.data ?? []).map((o) => ({
		id: o.occupationId,
		name: o.name,
		acronym: o.acronym,
	}));
	const specialtiesQuery = useCandidateOccupationSpecialties(
		open ? selectedOccupationId : null,
	);
	const specialtyRows = (specialtiesQuery.data ?? []).map((s) => ({
		id: s.specialtyId,
		name: s.name,
		acronym: s.acronym,
	}));
	const locationsQuery = useLocationsForOrg();

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
						...(value.experienceBand
							? { totalProfessionalExperienceBand: value.experienceBand }
							: {}),
						preferredShiftTypes: value.preferredShiftTypes,
						willingToRelocate: value.willingToRelocate,
					},
					{
						onSuccess: () => {
							toast.success("Professional information updated");
							if (!isControlled) setInternalOpen(false);
							controlledOnOpenChange?.(false);
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
			setSelectedOccupationId(profile.occupationId?.trim() ?? "");
		}
		if (!isControlled) {
			setInternalOpen(nextOpen);
		}
		controlledOnOpenChange?.(nextOpen);
	};

	useEffect(() => {
		if (!isControlled) return;
		if (controlledOpen && !prevControlledOpenRef.current) {
			form.reset(buildDefaultValues(profile));
			setSelectedOccupationId(profile.occupationId?.trim() ?? "");
		}
		prevControlledOpenRef.current = Boolean(controlledOpen);
	}, [isControlled, controlledOpen, profile, form]);

	useEffect(() => {
		if (!open || !focusSection) return;
		let cancelled = false;
		const outer = requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (cancelled) return;
				document
					.querySelector(`[data-professional-focus="${focusSection}"]`)
					?.scrollIntoView({ behavior: "smooth", block: "center" });
			});
		});
		return () => {
			cancelled = true;
			cancelAnimationFrame(outer);
		};
	}, [open, focusSection]);

	const specialtiesLocked = hasSelectedSpecialties(profile);

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
					<div data-professional-focus="occupation">
						<form.Field name="occupationId">
							{(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>
										Occupation <RequiredStar />
									</FieldLabel>
									<Select
										disabled={hasSelectedOccupation(profile)}
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
											{occupationOptions.map((occ) => (
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
					</div>

					<div data-professional-focus="specialties">
						<form.Field name="specialtyIds">
							{(field) => (
								<Field data-disabled={specialtiesLocked ? true : undefined}>
									<FieldLabel>Specialties</FieldLabel>
									<div
										className={
											!selectedOccupationId ||
											specialtiesQuery.isLoading ||
											specialtiesLocked
												? "pointer-events-none opacity-50"
												: undefined
										}
									>
										<MultiSelect
											values={field.state.value}
											onValuesChange={field.handleChange}
										>
											<MultiSelectTrigger
												className="w-full"
												disabled={specialtiesLocked}
											>
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
					</div>

					<form.Field name="experienceBand">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>
									Years of Experience
								</FieldLabel>
								<Select
									value={field.state.value ?? ""}
									onValueChange={(val) =>
										field.handleChange(
											val === "" ? null : (val as CandidateExperienceBand),
										)
									}
								>
									<SelectTrigger id={field.name}>
										<SelectValue placeholder="Select experience band" />
									</SelectTrigger>
									<SelectContent>
										{CANDIDATE_EXPERIENCE_BAND_OPTIONS.map((opt) => (
											<SelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						)}
					</form.Field>

					<div data-professional-focus="shifts">
						<form.Field name="preferredShiftTypes">
							{(field) => (
								<Field>
									<FieldLabel>Preferred Shift Types</FieldLabel>
									<MultiSelect
										values={field.state.value}
										onValuesChange={(v) =>
											field.handleChange(v as ShiftTypeValue[])
										}
									>
										<MultiSelectTrigger className="w-full">
											<MultiSelectValue placeholder="Select shift types" />
										</MultiSelectTrigger>
										<MultiSelectContent>
											{SHIFT_TYPE_OPTIONS.map((opt) => (
												<MultiSelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</MultiSelectItem>
											))}
										</MultiSelectContent>
									</MultiSelect>
								</Field>
							)}
						</form.Field>
					</div>

					<div data-professional-focus="locations">
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
														{[loc.name, loc.city, loc.state]
															.filter(Boolean)
															.join(", ") || loc.name}
													</MultiSelectItem>
												))}
											</MultiSelectContent>
										</MultiSelect>
									</div>
								</Field>
							)}
						</form.Field>
					</div>

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
									onClick={() => handleOpenChange(false)}
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
