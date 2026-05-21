"use client";

import {
	CANDIDATE_PREFERRED_CONTRACT_LENGTH_OPTIONS,
	type CandidatePreferredContractLength,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { InputGroup, InputGroupInput } from "@repo/ui/components/input-group";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@repo/ui/components/multi-select";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { ProfessionalResumeField } from "@/components/candidate-sign-up/ProfessionalResumeField";
import { useProfessionalDetailsStepForm } from "@/hooks/candidate/use-professional-details-step-form";
import {
	type ProfessionalDetailsFormValues,
	type ProfessionalDetailsInviteFormValues,
	professionalDetailsObjectSchema,
} from "@/schemas/candidate-sign-up.schema";

interface ProfessionalDetailsStepProps {
	defaultValues: Partial<ProfessionalDetailsFormValues>;
	onBack: () => void;
	onContinue?: (values: ProfessionalDetailsFormValues) => void;
	onSubmit?: (
		values: ProfessionalDetailsFormValues | ProfessionalDetailsInviteFormValues,
	) => void;
	onValuesChange?: (
		values: ProfessionalDetailsFormValues | ProfessionalDetailsInviteFormValues,
	) => void;
	inviteMode?: boolean;
	occupationId?: string;
	occupationName?: string;
	token?: string;
	orgId?: string;
	existingResumeKey?: string | null;
	onRequestResumeSignedUrl?: () => Promise<string | null>;
}

export function ProfessionalDetailsStep({
	defaultValues,
	onBack,
	onContinue,
	onSubmit,
	onValuesChange,
	inviteMode,
	occupationId,
	occupationName,
	orgId,
	existingResumeKey,
	onRequestResumeSignedUrl,
}: ProfessionalDetailsStepProps) {
	const {
		form,
		occupationsData,
		occupationsLoading,
		specialties,
		specialtiesLoading,
		canFetchSpecialties,
		onScrollToBottomOccupations,
		onScrollToBottomSpecialties,
		formOccupationId,
	} = useProfessionalDetailsStepForm({
		defaultValues,
		onContinue,
		onSubmit,
		onValuesChange,
		inviteMode,
		occupationId,
		occupationName,
		orgId,
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<>
			<div className="space-y-1">
				<h2 className="text-lg font-semibold">Professional Details</h2>
				<p className="text-muted-foreground text-sm">
					Tell us about your occupation and experience
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					void form.handleSubmit();
				}}
				className="space-y-4"
			>
				<FieldGroup>
					{inviteMode && occupationName ? (
						<Field>
							<FieldLabel className="text-sm font-medium">
								Occupation
							</FieldLabel>
							<p className="text-sm text-muted-foreground">{occupationName}</p>
						</Field>
					) : (
						<form.Field
							name="occupationId"
							validators={{
								onChange: professionalDetailsObjectSchema.shape.occupationId,
							}}
						>
							{(field) => {
								const isInvalid = formFieldShowInvalid(
									field.state.meta.isTouched,
									field.state.meta.isValid,
									submissionAttempts,
								);
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel className="text-sm font-medium">
											Occupation <RequiredStar />
										</FieldLabel>
										<MultiSelect
											single
											values={field.state.value ? [field.state.value] : []}
											onValuesChange={(v) => {
												field.handleChange(v[0] ?? "");
												form.setFieldValue("specialtyIds", []);
											}}
										>
											<MultiSelectTrigger
												id={field.name}
												className="w-full justify-between"
												disabled={!orgId || occupationsLoading}
												aria-invalid={isInvalid}
											>
												<MultiSelectValue placeholder="Search for your occupation..." />
											</MultiSelectTrigger>
											<MultiSelectContent
												search={{ placeholder: "Search..." }}
												onScrollToBottom={onScrollToBottomOccupations}
											>
												{occupationsLoading ? (
													<div className="py-6 text-center text-sm text-muted-foreground">
														Loading occupations...
													</div>
												) : null}
												{!occupationsLoading &&
													occupationsData.map((occ) => (
														<MultiSelectItem key={occ.id} value={occ.id}>
															{occ.name}
														</MultiSelectItem>
													))}
												{!occupationsLoading &&
												orgId &&
												occupationsData.length === 0 ? (
													<div className="py-6 text-center text-sm text-muted-foreground">
														No occupations available
													</div>
												) : null}
											</MultiSelectContent>
										</MultiSelect>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>
					)}

					<form.Field name="specialtyIds">
						{(field) => (
							<Field>
								<FieldLabel className="text-sm font-medium">
									Specialties
								</FieldLabel>
								<MultiSelect
									key={`specialties-${formOccupationId}-${inviteMode}`}
									single={false}
									values={field.state.value}
									onValuesChange={(v) => field.handleChange(v)}
								>
									<MultiSelectTrigger
										className="w-full justify-between"
										disabled={!canFetchSpecialties || specialtiesLoading}
									>
										<MultiSelectValue placeholder="Search for specialties..." />
									</MultiSelectTrigger>
									<MultiSelectContent
										search={{ placeholder: "Search..." }}
										shouldFilter={false}
										onScrollToBottom={onScrollToBottomSpecialties}
									>
										{specialtiesLoading ? (
											<div className="py-6 text-center text-sm text-muted-foreground">
												Loading specialties...
											</div>
										) : null}
										{!specialtiesLoading &&
											specialties.map((s) => (
												<MultiSelectItem key={s.id} value={s.id}>
													{s.label}
												</MultiSelectItem>
											))}
										{!specialtiesLoading &&
										canFetchSpecialties &&
										specialties.length === 0 ? (
											<div className="py-6 text-center text-sm text-muted-foreground">
												No specialties for this occupation
											</div>
										) : null}
									</MultiSelectContent>
								</MultiSelect>
							</Field>
						)}
					</form.Field>

					<form.Field name="preferredContractLengths">
						{(field) => (
							<Field>
								<FieldLabel className="text-sm font-medium">
									What contract length(s) do you prefer?
								</FieldLabel>
								<MultiSelect
									values={field.state.value}
									onValuesChange={(v) =>
										field.handleChange(v as CandidatePreferredContractLength[])
									}
								>
									<MultiSelectTrigger className="w-full justify-between">
										<MultiSelectValue placeholder="Select options..." />
									</MultiSelectTrigger>
									<MultiSelectContent search={{ placeholder: "Search..." }}>
										{CANDIDATE_PREFERRED_CONTRACT_LENGTH_OPTIONS.map((opt) => (
											<MultiSelectItem key={opt.value} value={opt.value}>
												{opt.label}
											</MultiSelectItem>
										))}
									</MultiSelectContent>
								</MultiSelect>
							</Field>
						)}
					</form.Field>

					<form.Field
						name="yearsOfExperience"
						validators={{
							onChange: professionalDetailsObjectSchema.shape.yearsOfExperience,
						}}
					>
						{(field) => {
							const isInvalid = formFieldShowInvalid(
								field.state.meta.isTouched,
								field.state.meta.isValid,
								submissionAttempts,
							);
							const raw = field.state.value;
							const num = typeof raw === "number" ? raw : Number(raw);
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel
										htmlFor={field.name}
										className="text-sm font-medium"
									>
										Years of Experience <RequiredStar />
									</FieldLabel>
									<InputGroup>
										<InputGroupInput
											id={field.name}
											name={field.name}
											type="number"
											min={0}
											max={50}
											placeholder="Enter years of experience"
											value={Number.isNaN(num) ? "" : num}
											onBlur={field.handleBlur}
											onChange={(e) => {
												const v = e.target.valueAsNumber;
												field.handleChange(v);
											}}
											aria-invalid={isInvalid}
										/>
									</InputGroup>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="resumeFile">
						{(field) => {
							const isInvalid = formFieldShowInvalid(
								field.state.meta.isTouched,
								field.state.meta.isValid,
								submissionAttempts,
							);
							const err = field.state.meta.errors;
							const firstError =
								Array.isArray(err) && err[0] != null
									? typeof err[0] === "string"
										? err[0]
										: (err[0] as { message?: string }).message
									: undefined;
							return (
								<ProfessionalResumeField
									file={field.state.value}
									existingResumeKey={existingResumeKey}
									onRequestResumeSignedUrl={onRequestResumeSignedUrl}
									onFileChange={(fileNext) => field.handleChange(fileNext)}
									error={isInvalid ? firstError : undefined}
									aria-invalid={isInvalid}
								/>
							);
						}}
					</form.Field>
				</FieldGroup>

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
								{onContinue ? "Next" : "Create Account"}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</>
	);
}
