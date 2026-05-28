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
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { cn } from "@repo/ui/lib/utils";
import { useStore } from "@tanstack/react-form";
import { format } from "date-fns";
import {
	ArrowLeft,
	ArrowRight,
	Briefcase,
	CheckCircle2,
	ClipboardList,
	Loader2,
	SquarePen,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import type {
	CandidateOnboardingQuestionnaireScope,
	CandidateOnboardingQuestionnaires,
} from "@/services/onboarding.service";

type ScopeKind = "occupation" | "specialty";

function isAnswerEmpty(type: string, value: string): boolean {
	if (type === "CHECKBOX") {
		return (
			value
				.split(",")
				.map((s) => s.trim())
				.filter((s) => s.length > 0).length === 0
		);
	}
	return value.trim().length === 0;
}

function scopeStatus(
	scope: CandidateOnboardingQuestionnaireScope,
	answers: Record<string, string>,
): { totalRequired: number; missingRequired: number; allDone: boolean } {
	let totalRequired = 0;
	let missingRequired = 0;
	for (const q of scope.questions) {
		if (q.required) {
			totalRequired += 1;
			if (isAnswerEmpty(q.type, answers[q.id] ?? "")) {
				missingRequired += 1;
			}
		}
	}
	const hasAny = scope.questions.length > 0;
	let allDone: boolean;
	if (!hasAny) {
		allDone = true;
	} else if (totalRequired > 0) {
		allDone = missingRequired === 0;
	} else {
		// Optional-only: show Done only after save (each question id appears in `answers`).
		allDone = scope.questions.every((q) => Object.hasOwn(answers, q.id));
	}
	return { totalRequired, missingRequired, allDone };
}

interface PreferencesQuestionnairesStepProps {
	defaultValues: Partial<PreferencesQuestionnairesFormValues>;
	occupationName: string;
	onBack: () => void;
	onContinue: (values: PreferencesQuestionnairesFormValues) => void;
	onValuesChange?: (values: PreferencesQuestionnairesFormValues) => void;
	questionnaires: CandidateOnboardingQuestionnaires | null;
	questionnaireAnswers: Record<string, string>;
	questionnairesLoading: boolean;
	savingScopeId: string | null;
	onSaveScopeAnswers: (
		kind: ScopeKind,
		scopeId: string,
		answers: Record<string, string>,
	) => Promise<void>;
}

export function PreferencesQuestionnairesStep({
	defaultValues,
	occupationName,
	onBack,
	onContinue,
	onValuesChange,
	questionnaires,
	questionnaireAnswers,
	questionnairesLoading,
	savingScopeId,
	onSaveScopeAnswers,
}: Readonly<PreferencesQuestionnairesStepProps>) {
	const [openScope, setOpenScope] = useState<{
		kind: ScopeKind;
		id: string;
	} | null>(null);

	const { form } = usePreferencesQuestionnairesStepForm({
		defaultValues,
		onContinue,
		onValuesChange,
	});

	const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	const occupationLabel = occupationName.trim() || "your role";

	const scopeCards = useMemo(() => {
		const cards: Array<{
			kind: ScopeKind;
			scope: CandidateOnboardingQuestionnaireScope;
		}> = [];
		if (
			questionnaires?.occupation &&
			questionnaires.occupation.questions.length > 0
		) {
			cards.push({ kind: "occupation", scope: questionnaires.occupation });
		}
		for (const specialty of questionnaires?.specialties ?? []) {
			if (specialty.questions.length > 0) {
				cards.push({ kind: "specialty", scope: specialty });
			}
		}
		return cards;
	}, [questionnaires]);

	const allRequiredAnswered = useMemo(() => {
		for (const { scope } of scopeCards) {
			const { allDone } = scopeStatus(scope, questionnaireAnswers);
			if (!allDone) return false;
		}
		return true;
	}, [scopeCards, questionnaireAnswers]);

	const activeScopeData = useMemo(() => {
		if (!openScope) return null;
		const card = scopeCards.find(
			(c) => c.kind === openScope.kind && c.scope.id === openScope.id,
		);
		return card ?? null;
	}, [openScope, scopeCards]);

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
												What contract length(s) do you prefer? <RequiredStar />
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
												What shift type(s) do you prefer? <RequiredStar />
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
												min={today}
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
						{(field) => {
							const isInvalid = formFieldShowInvalid(
								field.state.meta.isTouched,
								field.state.meta.isValid,
								submissionAttempts,
							);
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel className="text-sm font-medium">
										How many total years of professional experience do you have?{" "}
										<RequiredStar />
									</FieldLabel>
									<RadioGroup
										className="space-y-2"
										value={field.state.value}
										onValueChange={(next) =>
											field.handleChange(
												next as TotalProfessionalExperienceBand,
											)
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
									{isInvalid ? (
										<FieldError errors={field.state.meta.errors} />
									) : null}
								</Field>
							);
						}}
					</form.Field>

					{questionnairesLoading ? (
						<Card className="border-border/80 shadow-none">
							<CardContent className="py-6">
								<p className="text-muted-foreground text-sm">
									Loading questionnaires...
								</p>
							</CardContent>
						</Card>
					) : null}

					{scopeCards.map(({ kind, scope }) => {
						const { totalRequired, missingRequired, allDone } = scopeStatus(
							scope,
							questionnaireAnswers,
						);
						const totalQuestions = scope.questions.length;
						const cardTitle =
							kind === "occupation"
								? `${occupationLabel} — Occupation questions`
								: `${scope.name} — Specialty questions`;
						const description =
							totalRequired > 0
								? `${totalRequired} required ${totalRequired === 1 ? "question" : "questions"} — improves job matching`
								: "Optional but encouraged — improves job matching";
						const hasStarted = scope.questions.some(
							(q) => !isAnswerEmpty(q.type, questionnaireAnswers[q.id] ?? ""),
						);
						return (
							<Card
								key={`${kind}-${scope.id}`}
								className={cn(
									"shadow-none transition-colors",
									allDone
										? "border-emerald-600/70 bg-emerald-50/60 dark:bg-emerald-950/35"
										: "border-border/80",
								)}
							>
								<CardHeader className="flex flex-row items-start gap-4 pb-2">
									<div
										className={cn(
											"flex size-12 shrink-0 items-center justify-center rounded-lg",
											allDone ? "bg-emerald-600 text-white" : "bg-muted",
										)}
									>
										{allDone ? (
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
											<CardTitle className="text-base">{cardTitle}</CardTitle>
											{allDone ? (
												<span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-400">
													<CheckCircle2 className="size-3.5 shrink-0" />
													Done
												</span>
											) : missingRequired > 0 ? (
												<span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
													{missingRequired} required missing
												</span>
											) : null}
										</div>
										<CardDescription>{description}</CardDescription>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="text-muted-foreground text-sm leading-relaxed">
										Answer {totalQuestions}{" "}
										{totalQuestions === 1 ? "question" : "questions"} for{" "}
										{scope.name}.
									</p>
									<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
										<Button
											type="button"
											variant={hasStarted ? "outline" : "default"}
											className="inline-flex w-full gap-2 sm:w-auto"
											onClick={() => setOpenScope({ kind, id: scope.id })}
										>
											{hasStarted ? (
												<>
													<SquarePen
														className="size-4"
														data-icon="inline-start"
														aria-hidden
													/>
													{allDone ? "Edit answers" : "Continue"}
												</>
											) : (
												<>
													<Briefcase
														className="size-4"
														data-icon="inline-start"
													/>
													Start questions
													<ArrowRight
														className="size-4 opacity-90"
														data-icon="inline-end"
													/>
												</>
											)}
										</Button>
									</div>
								</CardContent>
							</Card>
						);
					})}

					{activeScopeData ? (
						<OccupationQuestionnaireDialog
							open
							onOpenChange={(o) => {
								if (!o) setOpenScope(null);
							}}
							dialogTitle={
								activeScopeData.kind === "occupation"
									? `${occupationLabel} — Occupation questions`
									: `${activeScopeData.scope.name} — Specialty questions`
							}
							dialogDescription="Improves job matching"
							questions={activeScopeData.scope.questions}
							initialAnswers={Object.fromEntries(
								activeScopeData.scope.questions.map((q) => [
									q.id,
									questionnaireAnswers[q.id] ?? "",
								]),
							)}
							saving={savingScopeId === activeScopeData.scope.id}
							onSave={async (next) => {
								await onSaveScopeAnswers(
									activeScopeData.kind,
									activeScopeData.scope.id,
									next,
								);
								setOpenScope(null);
							}}
						/>
					) : null}
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
						{({ isSubmitting, canSubmit }) => {
							const blockedByQuestionnaires = !allRequiredAnswered;
							return (
								<Button
									type="submit"
									disabled={
										!canSubmit ||
										isSubmitting ||
										questionnairesLoading ||
										blockedByQuestionnaires
									}
									className="gap-2"
									title={
										blockedByQuestionnaires
											? "Answer all required questionnaire questions"
											: undefined
									}
								>
									{isSubmitting ? (
										<Loader2 className="size-4 animate-spin" />
									) : null}
									Continue
									<ArrowRight className="size-4" />
								</Button>
							);
						}}
					</form.Subscribe>
				</div>
			</form>
		</>
	);
}
