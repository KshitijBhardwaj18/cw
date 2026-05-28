"use client";

import { Button } from "@repo/ui/components/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
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
	existingResumeKey,
	onRequestResumeSignedUrl,
}: Readonly<ProfessionalDetailsStepProps>) {
	const {
		form,
		occupationsData,
		occupationsLoading,
		specialties,
		specialtiesLoading,
		canFetchSpecialties,
		onScrollToBottomOccupations,
	} = useProfessionalDetailsStepForm({
		defaultValues,
		onContinue,
		onSubmit,
		onValuesChange,
		inviteMode,
		occupationId,
		occupationName,
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
												disabled={occupationsLoading}
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
												{!occupationsLoading && occupationsData.length === 0 ? (
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

					<form.Field
						name="specialtyIds"
						validators={{
							onChange: professionalDetailsObjectSchema.shape.specialtyIds,
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
										Specialties <RequiredStar />
									</FieldLabel>
									<MultiSelect
										single={false}
										values={field.state.value}
										onValuesChange={(v) => field.handleChange(v)}
									>
										<MultiSelectTrigger
											className="w-full justify-between"
											disabled={!canFetchSpecialties || specialtiesLoading}
											aria-invalid={isInvalid}
										>
											<MultiSelectValue placeholder="Search for specialties..." />
										</MultiSelectTrigger>
										<MultiSelectContent search={{ placeholder: "Search..." }}>
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
