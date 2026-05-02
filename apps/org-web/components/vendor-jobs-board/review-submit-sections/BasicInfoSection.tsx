"use client";

import { Checkbox } from "@repo/ui/components/checkbox";
import { DatePicker } from "@repo/ui/components/date-picker";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
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
import { DetailInputField } from "@repo/ui/general/DetailInputField";
import { cn } from "@repo/ui/lib/utils";
import { useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import type { ReviewSubmitFormApi } from "@/schemas/vendor-jobs-board.schema";
import { OnboardingService } from "@/services/onboarding.service";

export interface BasicInfoSectionProps {
	form: ReviewSubmitFormApi;
	isEditing: boolean;
	/** When not editing, show these labels (from server profile). */
	occupationDisplayName: string;
	specialtiesDisplayLabel: string;
}

export function BasicInfoSection({
	form,
	isEditing,
	occupationDisplayName,
	specialtiesDisplayLabel,
}: BasicInfoSectionProps) {
	const occupationId = useStore(form.store, (s) => s.values.occupationId);

	const occupationsQuery = useQuery({
		queryKey: ["vendor-job-board-org-occupations"],
		queryFn: () =>
			OnboardingService.getOccupationsForOrg({ page: 1, limit: 20 }),
		staleTime: 60_000,
	});

	const specialtiesQuery = useQuery({
		queryKey: ["vendor-job-board-org-specialties", occupationId],
		queryFn: async () => {
			const data =
				await OnboardingService.listCatalogSpecialtiesForOccupation(
					occupationId,
				);
			return { data };
		},
		enabled: Boolean(occupationId),
		staleTime: 60_000,
	});

	const occupationRows = occupationsQuery.data?.data ?? [];
	const specialtyRows = specialtiesQuery.data?.data ?? [];

	return (
		<div className="space-y-4">
			<h4 className="font-bold text-foreground text-base">
				Candidate Basic Information
			</h4>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
				<form.Field name="firstName">
					{(field) => (
						<DetailInputField
							label="First Name"
							value={field.state.value}
							readOnly
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
						/>
					)}
				</form.Field>
				<form.Field name="lastName">
					{(field) => (
						<DetailInputField
							label="Last Name"
							value={field.state.value}
							readOnly
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
						/>
					)}
				</form.Field>
				<form.Field name="email">
					{(field) => (
						<DetailInputField
							label="Email"
							value={field.state.value}
							readOnly
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
						/>
					)}
				</form.Field>
				<form.Field name="phoneNumber">
					{(field) => (
						<DetailInputField
							label="Phone"
							value={field.state.value}
							type="phone"
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
						/>
					)}
				</form.Field>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
				<form.Field name="streetAddress">
					{(field) => (
						<DetailInputField
							label="Street address"
							value={field.state.value}
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
						/>
					)}
				</form.Field>
				<form.Field name="city">
					{(field) => (
						<DetailInputField
							label="City"
							value={field.state.value}
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
						/>
					)}
				</form.Field>
				<form.Field name="state">
					{(field) => (
						<DetailInputField
							label="State"
							value={field.state.value}
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
						/>
					)}
				</form.Field>
				<form.Field name="zipCode">
					{(field) => (
						<DetailInputField
							label="ZIP code"
							value={field.state.value}
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
						/>
					)}
				</form.Field>
			</div>

			<div className="space-y-4 pt-4">
				<h4 className="font-bold text-foreground text-base">
					Occupation &amp; specialties
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
					<form.Field name="occupationId">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel className="font-medium">Occupation</FieldLabel>
									{!isEditing ? (
										<p className="text-sm py-2 border-b border-transparent">
											{occupationDisplayName}
										</p>
									) : (
										<Select
											value={field.state.value}
											onValueChange={(v) => {
												field.handleChange(v);
												form.setFieldValue("specialtyIds", []);
											}}
											disabled={occupationsQuery.isLoading}
										>
											<SelectTrigger
												className={cn(
													"w-full",
													isInvalid && "border-destructive",
												)}
												aria-invalid={isInvalid}
											>
												<SelectValue placeholder="Select occupation" />
											</SelectTrigger>
											<SelectContent>
												{occupationRows.map((o) => (
													<SelectItem key={o.id} value={o.id}>
														{o.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="specialtyIds">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel className="font-medium">Specialties</FieldLabel>
									{!isEditing ? (
										<p className="text-sm py-2">{specialtiesDisplayLabel}</p>
									) : (
										<MultiSelect
											values={field.state.value ?? []}
											onValuesChange={(v) => field.handleChange(v)}
										>
											<MultiSelectTrigger
												className={cn(
													"h-auto min-h-10 w-full justify-between py-2 whitespace-normal",
													isInvalid && "border-destructive",
												)}
												aria-invalid={isInvalid}
												disabled={!occupationId || specialtiesQuery.isLoading}
											>
												<MultiSelectValue placeholder="Choose specialties…" />
											</MultiSelectTrigger>
											<MultiSelectContent>
												{specialtyRows.map((s) => (
													<MultiSelectItem key={s.id} value={s.id}>
														{s.name}
													</MultiSelectItem>
												))}
											</MultiSelectContent>
										</MultiSelect>
									)}
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
				</div>
			</div>

			<div className="space-y-4 pt-2">
				<h4 className="font-bold text-foreground text-base">Availability</h4>
				<p className="text-sm text-muted-foreground -mt-2">
					Set when this candidate can start and whether they are actively
					available—same fields candidates fill; you can update on their behalf
					before submit.
				</p>
				<form.Field name="preferredShiftsText">
					{(field) => (
						<DetailInputField
							label="Preferred shifts (comma-separated, e.g. Day, Night)"
							value={field.state.value}
							editMode={isEditing}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={field.handleChange}
							errors={field.state.meta.errors}
						/>
					)}
				</form.Field>
				<div className="space-y-4 max-w-lg">
					<form.Field name="availableFrom">
						{(field) => (
							<Field className="space-y-2">
								<FieldLabel className="font-medium">Available from</FieldLabel>
								{!isEditing ? (
									<p className="text-sm text-foreground rounded-md border border-transparent py-2">
										{field.state.value?.trim() ? field.state.value : "Not set"}
									</p>
								) : (
									<DatePicker
										value={field.state.value ?? ""}
										onChange={(v) => field.handleChange(v)}
										placeholder="Pick a start date"
									/>
								)}
							</Field>
						)}
					</form.Field>
					<form.Field name="isAvailable">
						{(field) => (
							<div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
								<Checkbox
									id={`${field.name}-availability`}
									className="mt-0.5"
									checked={field.state.value}
									disabled={!isEditing}
									onCheckedChange={(c) => field.handleChange(c === true)}
								/>
								<div className="min-w-0 flex-1 space-y-0.5">
									<FieldLabel
										htmlFor={`${field.name}-availability`}
										className="text-sm font-medium leading-none cursor-pointer"
									>
										Currently available for work
									</FieldLabel>
									<p className="text-xs text-muted-foreground">
										Uncheck if the candidate is not taking assignments right
										now.
									</p>
								</div>
							</div>
						)}
					</form.Field>
				</div>
			</div>
		</div>
	);
}
