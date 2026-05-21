"use client";

import {
	CANDIDATE_PREFERRED_CONTRACT_LENGTH_OPTIONS,
	type CandidatePreferredContractLength,
} from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@repo/ui/components/multi-select";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { cn } from "@repo/ui/lib/utils";
import { useStore } from "@tanstack/react-form";
import {
	ArrowLeft,
	ArrowRight,
	Briefcase,
	CheckCircle2,
	ClipboardList,
	Loader2,
	SquarePen,
} from "lucide-react";
import { useState } from "react";
import { OccupationQuestionnaireDialog } from "@/components/candidate-sign-up/OccupationQuestionnaireDialog";
import { usePreferencesQuestionnairesStepForm } from "@/hooks/candidate/use-preferences-questionnaires-step-form";
import {
	type PreferencesQuestionnairesFormValues,
	preferencesQuestionnairesSchema,
	QUESTIONNAIRE_SHIFT_TYPE_OPTIONS,
	type QuestionnaireShiftTypeValue,
	TOTAL_PROFESSIONAL_EXPERIENCE_BAND_LABELS,
	TOTAL_PROFESSIONAL_EXPERIENCE_BANDS,
	type TotalProfessionalExperienceBand,
} from "@/schemas/candidate-sign-up.schema";

interface PreferencesQuestionnairesStepProps {
	defaultValues: Partial<PreferencesQuestionnairesFormValues>;
	occupationName: string;
	onBack: () => void;
	onContinue: (values: PreferencesQuestionnairesFormValues) => void;
	onValuesChange?: (values: PreferencesQuestionnairesFormValues) => void;
}

export function PreferencesQuestionnairesStep({
	defaultValues,
	occupationName,
	onBack,
	onContinue,
	onValuesChange,
}: PreferencesQuestionnairesStepProps) {
	const [occupationDialogOpen, setOccupationDialogOpen] = useState(false);

	const { form } = usePreferencesQuestionnairesStepForm({
		defaultValues,
		onContinue,
		onValuesChange,
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const occupationLabel = occupationName.trim() || "your role";
	const specialtyDialogTitle = `${occupationLabel} - Specialty Questions`;

	return (
		<>
			<div className="space-y-1">
				<h2 className="text-lg font-semibold">
					Preferences &amp; questionnaires
				</h2>
				<p className="text-muted-foreground text-sm">
					Help us understand how you prefer to work
				</p>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					void form.handleSubmit();
				}}
				className="space-y-6"
			>
				<FieldGroup className="space-y-6">
					<Card className="border-border/80 shadow-none">
						<CardHeader className="flex flex-row items-start gap-4 pb-4">
							<div
								className={cn(
									"flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
								)}
							>
								<ClipboardList className="size-6" aria-hidden />
							</div>
							<div className="space-y-1">
								<CardTitle className="text-base">
									General questionnaire
								</CardTitle>
								<CardDescription>
									Optional — Helps us match you with the right opportunities
								</CardDescription>
							</div>
						</CardHeader>
						<CardContent className="space-y-4 pt-0">
							<form.Field
								name="preferredContractLengths"
								validators={{
									onChange:
										preferencesQuestionnairesSchema.shape
											.preferredContractLengths,
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
												What contract length(s) do you prefer?
											</FieldLabel>
											<MultiSelect
												values={field.state.value}
												onValuesChange={(v) =>
													field.handleChange(
														v as CandidatePreferredContractLength[],
													)
												}
											>
												<MultiSelectTrigger
													className="w-full justify-between border-primary/40"
													aria-invalid={isInvalid}
												>
													<MultiSelectValue placeholder="Select options..." />
												</MultiSelectTrigger>
												<MultiSelectContent search={{ placeholder: "Search…" }}>
													{CANDIDATE_PREFERRED_CONTRACT_LENGTH_OPTIONS.map(
														(opt) => (
															<MultiSelectItem
																key={opt.value}
																value={opt.value}
															>
																{opt.label}
															</MultiSelectItem>
														),
													)}
												</MultiSelectContent>
											</MultiSelect>
											{isInvalid ? (
												<FieldError errors={field.state.meta.errors} />
											) : null}
										</Field>
									);
								}}
							</form.Field>

							<form.Field
								name="preferredShiftTypes"
								validators={{
									onChange:
										preferencesQuestionnairesSchema.shape.preferredShiftTypes,
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
												What shift type(s) do you prefer?
											</FieldLabel>
											<MultiSelect
												values={field.state.value}
												onValuesChange={(v) =>
													field.handleChange(v as QuestionnaireShiftTypeValue[])
												}
											>
												<MultiSelectTrigger
													className="w-full justify-between border-primary/40"
													aria-invalid={isInvalid}
												>
													<MultiSelectValue placeholder="Select options..." />
												</MultiSelectTrigger>
												<MultiSelectContent>
													{QUESTIONNAIRE_SHIFT_TYPE_OPTIONS.map((opt) => (
														<MultiSelectItem key={opt.value} value={opt.value}>
															{opt.label}
														</MultiSelectItem>
													))}
												</MultiSelectContent>
											</MultiSelect>
											{isInvalid ? (
												<FieldError errors={field.state.meta.errors} />
											) : null}
										</Field>
									);
								}}
							</form.Field>

							<form.Field
								name="earliestStartDate"
								validators={{
									onChange:
										preferencesQuestionnairesSchema.shape.earliestStartDate,
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
											<FieldLabel
												htmlFor={field.name}
												className="text-sm font-medium"
											>
												What is your earliest available start date?
											</FieldLabel>
											<DatePicker
												id={field.name}
												value={field.state.value ?? ""}
												onChange={(v) => field.handleChange(v)}
												onBlur={field.handleBlur}
												placeholder="Pick a date"
												clearable
												className="border-primary/40"
												aria-invalid={isInvalid}
											/>
											{isInvalid ? (
												<FieldError errors={field.state.meta.errors} />
											) : null}
										</Field>
									);
								}}
							</form.Field>

							<form.Field
								name="recentJobTitle"
								validators={{
									onChange:
										preferencesQuestionnairesSchema.shape.recentJobTitle,
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
											<FieldLabel
												htmlFor={field.name}
												className="text-sm font-medium"
											>
												What is your most recent job title?
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												placeholder="Enter your answer..."
												className="border-muted-foreground/30"
												value={field.state.value ?? ""}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											{isInvalid ? (
												<FieldError errors={field.state.meta.errors} />
											) : null}
										</Field>
									);
								}}
							</form.Field>
						</CardContent>
					</Card>

					<form.Field
						name="totalProfessionalExperienceBand"
						validators={{
							onChange:
								preferencesQuestionnairesSchema.shape
									.totalProfessionalExperienceBand,
						}}
					>
						{(field) => (
							<Field>
								<FieldLabel className="text-sm font-medium">
									How many total years of professional experience do you have?
								</FieldLabel>
								<RadioGroup
									className="space-y-2"
									value={field.state.value}
									onValueChange={(next) =>
										field.handleChange(next as TotalProfessionalExperienceBand)
									}
								>
									{TOTAL_PROFESSIONAL_EXPERIENCE_BANDS.map((band) => {
										const selected = field.state.value === band;
										return (
											<label
												key={band}
												htmlFor={`experience-band-${band}`}
												className={cn(
													"flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/40",
													selected && "border-primary ring-1 ring-primary/35",
												)}
											>
												<RadioGroupItem
													value={band}
													id={`experience-band-${band}`}
												/>
												<span className="text-sm font-medium leading-none">
													{TOTAL_PROFESSIONAL_EXPERIENCE_BAND_LABELS[band]}
												</span>
											</label>
										);
									})}
								</RadioGroup>
							</Field>
						)}
					</form.Field>

					<form.Subscribe selector={(state) => state.values}>
						{(values) => (
							<OccupationQuestionnaireDialog
								open={occupationDialogOpen}
								onOpenChange={setOccupationDialogOpen}
								occupationTitle={specialtyDialogTitle}
								initialEhrSystems={values.occupationEhrSystems ?? []}
								initialCertifications={values.occupationCertifications ?? []}
								onSave={({ ehrSystems, certifications }) => {
									form.setFieldValue("occupationEhrSystems", ehrSystems);
									form.setFieldValue(
										"occupationCertifications",
										certifications,
									);
									form.setFieldValue("occupationQuestionnaireCompleted", true);
								}}
							/>
						)}
					</form.Subscribe>

					<form.Subscribe
						selector={(s) => s.values.occupationQuestionnaireCompleted === true}
					>
						{(occupationQuestionnaireCompleted) => (
							<Card
								className={cn(
									"shadow-none transition-colors",
									occupationQuestionnaireCompleted
										? "border-emerald-600/70 bg-emerald-50/60 dark:bg-emerald-950/35"
										: "border-border/80",
								)}
							>
								<CardHeader className="flex flex-row items-start gap-4 pb-2">
									<div
										className={cn(
											"flex size-12 shrink-0 items-center justify-center rounded-lg",
											occupationQuestionnaireCompleted
												? "bg-emerald-600 text-white"
												: "bg-muted",
										)}
									>
										{occupationQuestionnaireCompleted ? (
											<CheckCircle2 className="size-6" aria-hidden />
										) : (
											<Briefcase
												className="text-muted-foreground size-6"
												aria-hidden
											/>
										)}
									</div>
									<div className="min-w-0 flex-1 space-y-1">
										<div className="flex flex-wrap items-center gap-2">
											<CardTitle className="text-base">
												{occupationLabel} — Occupation questions
											</CardTitle>
											{occupationQuestionnaireCompleted ? (
												<span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-400">
													<CheckCircle2 className="size-3.5 shrink-0" />
													Done
												</span>
											) : null}
										</div>
										<CardDescription>
											Optional but encouraged — Improves job matching
										</CardDescription>
									</div>
								</CardHeader>
								{occupationQuestionnaireCompleted ? (
									<CardContent className="space-y-4">
										<p className="text-muted-foreground text-sm leading-relaxed">
											Update your EHR systems or certifications if anything
											changes.
										</p>
										<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
											<Button
												type="button"
												variant="outline"
												className="inline-flex w-full gap-2 sm:w-auto"
												onClick={() => setOccupationDialogOpen(true)}
											>
												<SquarePen
													className="size-4"
													data-icon="inline-start"
													aria-hidden
												/>
												Edit questionnaire
											</Button>
										</div>
									</CardContent>
								) : (
									<CardContent className="space-y-4">
										<p className="text-muted-foreground text-sm leading-relaxed">
											Answer occupation-specific questions about your{" "}
											{occupationLabel} experience, certifications, and systems.
										</p>
										<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
											<Button
												type="button"
												variant="outline"
												className="w-full sm:w-auto"
												onClick={() => {
													form.setFieldValue("occupationEhrSystems", []);
													form.setFieldValue("occupationCertifications", []);
													form.setFieldValue(
														"occupationQuestionnaireCompleted",
														true,
													);
												}}
											>
												Skip for Now
											</Button>
											<Button
												type="button"
												className="inline-flex w-full gap-2 sm:w-auto"
												onClick={() => setOccupationDialogOpen(true)}
											>
												<Briefcase
													className="size-4"
													data-icon="inline-start"
												/>
												Start Occupation Questions
												<ArrowRight
													className="size-4 opacity-90"
													data-icon="inline-end"
												/>
											</Button>
										</div>
									</CardContent>
								)}
							</Card>
						)}
					</form.Subscribe>
				</FieldGroup>

				<div className="flex items-center justify-between gap-3 pt-6">
					<Button
						type="button"
						variant="outline"
						onClick={onBack}
						className="gap-2"
					>
						<ArrowLeft className="size-4" />
						Back
					</Button>
					<form.Subscribe
						selector={(state) => ({
							isSubmitting: state.isSubmitting,
							canSubmit: state.canSubmit,
						})}
					>
						{({ isSubmitting, canSubmit }) => (
							<Button
								type="submit"
								disabled={!canSubmit || isSubmitting}
								className="gap-2"
							>
								{isSubmitting ? (
									<Loader2 className="size-4 animate-spin" />
								) : null}
								Continue
								<ArrowRight className="size-4" />
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</>
	);
}
