"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DatePicker } from "@repo/ui/components/date-picker";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { cn } from "@repo/ui/lib/utils";
import { useStore } from "@tanstack/react-form";
import {
	Activity,
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	Check,
	Loader2,
	Medal,
	PlusCircle,
	Trash2,
	UploadCloud,
	UserRound,
	Users,
	X,
} from "lucide-react";
import type * as React from "react";
import { useRef } from "react";
import { useSubmissionReadinessStepForm } from "@/hooks/candidate/use-submission-readiness-step-form";
import {
	emptyProfessionalReference,
	type ProfessionalReferenceFormValues,
	professionalReferenceSchema,
	type SubmissionReadinessFormValues,
	submissionReadinessBaseSchema,
} from "@/schemas/candidate-sign-up.schema";

/** PDF + common image uploads for certifications (frontend validation only). */
const CERTIFICATION_ACCEPT =
	".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";

const REFERENCE_ROW_FIELDS: Array<{
	key: keyof ProfessionalReferenceFormValues;
	label: string;
}> = [
	{ key: "fullName", label: "Full Name" },
	{ key: "title", label: "Title" },
	{ key: "organization", label: "Organization" },
	{ key: "relationship", label: "Relationship" },
	{ key: "phone", label: "Phone" },
	{ key: "email", label: "Email" },
];

interface SubmissionReadinessStepProps {
	defaultValues: Partial<SubmissionReadinessFormValues>;
	onValuesChange?: (values: SubmissionReadinessFormValues) => void;
	onBack: () => void;
	onContinue: () => void | Promise<void>;
	isSubmitting?: boolean;
}

export function SubmissionReadinessStep({
	defaultValues,
	onValuesChange,
	onBack,
	onContinue,
	isSubmitting = false,
}: SubmissionReadinessStepProps) {
	const certInputRef = useRef<HTMLInputElement>(null);

	const { form } = useSubmissionReadinessStepForm({
		defaultValues,
		onSubmit: () => onContinue(),
		onValuesChange,
	});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<form
			className="space-y-6"
			onSubmit={(e) => {
				e.preventDefault();
				void form.handleSubmit();
			}}
		>
			<div className="space-y-1">
				<h2 className="text-lg font-semibold">
					Submission readiness &amp; compliance
				</h2>
				<p className="text-muted-foreground text-sm">
					Complete required items to start applying for jobs.
				</p>
			</div>

			<div
				className={cn(
					"rounded-xl border border-destructive/25 bg-red-50/90 p-4 shadow-inner",
					"dark:border-red-900/70 dark:bg-red-950/40",
				)}
			>
				<Alert
					variant="destructive"
					className="mb-6 border-destructive/40 bg-transparent text-destructive shadow-none [&>svg]:text-destructive"
				>
					<AlertTriangle className="size-4 shrink-0" aria-hidden />
					<AlertTitle>Required for Job Submission</AlertTitle>
					<AlertDescription className="text-destructive/90 dark:text-red-400">
						You must complete all items below to apply for jobs.
					</AlertDescription>
				</Alert>

				<div className="flex flex-col gap-6">
					{/* Identity */}
					<Card className="border-border/70 bg-background shadow-sm">
						<CardHeader className="flex flex-row items-start gap-4 pb-2">
							<div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
								<UserRound className="size-5" aria-hidden />
							</div>
							<div className="min-w-0 space-y-0.5">
								<CardTitle className="text-base leading-snug">
									Identity &amp; personal information <RequiredStar />
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<form.Field
								name="dateOfBirth"
								validators={{
									onBlur: submissionReadinessBaseSchema.shape.dateOfBirth,
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
											<FieldLabel htmlFor={field.name}>
												Date of birth <RequiredStar />
											</FieldLabel>
											<DatePicker
												id={field.name}
												value={field.state.value}
												onChange={(v) => field.handleChange(v)}
												onBlur={field.handleBlur}
												clearable={false}
												placeholder="dd-mm-yyyy"
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
								name="lastFourSsn"
								validators={{
									onBlur: submissionReadinessBaseSchema.shape.lastFourSsn,
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
											<FieldLabel htmlFor={field.name}>
												Last 4 of SSN <RequiredStar />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												inputMode="numeric"
												autoComplete="off"
												maxLength={4}
												placeholder="1234"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) =>
													field.handleChange(
														e.target.value.replace(/\D/g, "").slice(0, 4),
													)
												}
												className={cn(
													isInvalid &&
														"border-destructive focus-visible:border-destructive",
												)}
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

					{/* Certifications upload */}
					<Card className="border-border/70 bg-background shadow-sm">
						<CardHeader className="flex flex-row items-start gap-4 pb-2">
							<div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
								<Medal className="size-5" aria-hidden />
							</div>
							<div className="min-w-0 space-y-0.5">
								<CardTitle className="text-base leading-snug">
									Certifications Upload <RequiredStar />
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<form.Field name="certificationFiles">
								{(field) => {
									const isInvalid = formFieldShowInvalid(
										false,
										field.state.meta.isValid,
										submissionAttempts,
									);
									const files = field.state.value ?? [];
									return (
										<Field data-invalid={isInvalid}>
											<input
												ref={certInputRef}
												type="file"
												multiple
												className="hidden"
												accept={CERTIFICATION_ACCEPT}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
													const incoming = [...(e.target.files ?? [])];
													e.target.value = "";
													if (!incoming.length) return;
													const merged = [
														...(field.state.value ?? []),
														...incoming,
													];
													field.handleChange(merged);
												}}
											/>
											<button
												type="button"
												onClick={() => certInputRef.current?.click()}
												className={cn(
													"flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/35 bg-muted/20 px-4 py-12 text-center transition-colors hover:bg-muted/35",
													isInvalid && "border-destructive/60 bg-destructive/5",
												)}
												aria-invalid={isInvalid}
											>
												<UploadCloud
													className="text-primary size-10 shrink-0"
													aria-hidden
												/>
												<div>
													<p className="text-sm font-medium text-foreground">
														Upload BLS, ACLS, or other certifications
													</p>
													<p className="text-muted-foreground mt-1 text-xs">
														PDF, JPG, or PNG
													</p>
												</div>
											</button>
											{files.length > 0 ? (
												<ul className="mt-4 space-y-2">
													{files.map((file, idx) => (
														<li
															key={`${file.name}-${file.size}-${idx}`}
															className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-sm"
														>
															<span className="min-w-0 truncate">
																{file.name}
															</span>
															<Button
																type="button"
																size="sm"
																variant="ghost"
																className="text-destructive hover:text-destructive"
																onClick={() => {
																	const next = [...files];
																	next.splice(idx, 1);
																	field.handleChange(next);
																}}
															>
																<X className="size-4" aria-hidden />
																<span className="sr-only">Remove file</span>
															</Button>
														</li>
													))}
												</ul>
											) : null}
											{isInvalid ? (
												<FieldError errors={field.state.meta.errors} />
											) : null}
										</Field>
									);
								}}
							</form.Field>
						</CardContent>
					</Card>

					{/* Skills checklist */}
					<form.Field name="skillsChecklistCompleted">
						{(field) => (
							<Card className="border-border/70 bg-background shadow-sm">
								<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 pb-4">
									<div className="flex min-w-0 gap-4">
										<div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
											<Activity className="size-5" aria-hidden />
										</div>
										<div className="min-w-0 space-y-1">
											<CardTitle className="text-base leading-snug">
												Skills Checklist{" "}
												<span className="text-destructive" aria-hidden>
													*
												</span>
												<span className="sr-only"> (required)</span>
											</CardTitle>
											<CardDescription>
												Complete occupation-specific skills verification
											</CardDescription>
											<FieldError errors={field.state.meta.errors} />
										</div>
									</div>
									<div className="flex w-full shrink-0 justify-start sm:w-auto">
										{field.state.value === true ? (
											<span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/15 px-3 py-1 text-sm font-semibold text-emerald-800 dark:text-emerald-400">
												Completed
												<Check className="size-4 shrink-0" aria-hidden />
											</span>
										) : (
											<Button
												type="button"
												onClick={() => field.handleChange(true)}
											>
												Start Checklist
											</Button>
										)}
									</div>
								</CardHeader>
							</Card>
						)}
					</form.Field>

					{/* Professional references */}
					<Card className="border-border/70 bg-background shadow-sm">
						<CardHeader className="flex flex-row items-start gap-4 pb-2">
							<div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
								<Users className="size-5" aria-hidden />
							</div>
							<div className="min-w-0 flex-1">
								<CardTitle className="flex flex-wrap items-baseline gap-1 text-base leading-snug">
									<span>Professional References</span>
									<RequiredStar />
									<span className="text-destructive text-sm font-semibold tracking-tight">
										(Minimum 2)
									</span>
								</CardTitle>
							</div>
						</CardHeader>

						<CardContent className="space-y-4">
							<form.Field name="references" mode="array">
								{(listField) => (
									<div className="space-y-4">
										{listField.state.value.map((_, index) => (
											<Card
												key={`ref-${index}`}
												className="border-border bg-muted/30 gap-4 border shadow-none"
											>
												<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
													<CardTitle className="font-medium text-foreground text-sm">
														Reference {index + 1}
													</CardTitle>
													{listField.state.value.length > 2 ? (
														<Button
															type="button"
															size="sm"
															variant="ghost"
															className="h-8 shrink-0 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
															onClick={() => listField.removeValue(index)}
														>
															<Trash2 className="size-4 shrink-0" aria-hidden />
															<span className="sr-only">
																Remove reference {index + 1}
															</span>
														</Button>
													) : null}
												</CardHeader>
												<CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
													{REFERENCE_ROW_FIELDS.map(({ key: prop, label }) => (
														<form.Field
															key={`${prop}-${index}`}
															name={`references[${index}].${prop}`}
															validators={{
																onBlur: professionalReferenceSchema.shape[prop],
															}}
														>
															{(subField) => {
																const isInvalid = formFieldShowInvalid(
																	subField.state.meta.isTouched,
																	subField.state.meta.isValid,
																	submissionAttempts,
																);
																return (
																	<Field data-invalid={isInvalid}>
																		<FieldLabel
																			htmlFor={`ref-${index}-${prop}`}
																		>
																			{label} <RequiredStar />
																		</FieldLabel>
																		<Input
																			id={`ref-${index}-${prop}`}
																			value={subField.state.value}
																			onBlur={subField.handleBlur}
																			onChange={(e) =>
																				subField.handleChange(e.target.value)
																			}
																			autoComplete={
																				prop === "email" ? "email" : "off"
																			}
																			type={prop === "email" ? "email" : "text"}
																			placeholder={label}
																			aria-invalid={isInvalid}
																		/>
																		{isInvalid ? (
																			<FieldError
																				errors={subField.state.meta.errors}
																			/>
																		) : null}
																	</Field>
																);
															}}
														</form.Field>
													))}
												</CardContent>
											</Card>
										))}

										<Button
											type="button"
											className="text-primary hover:text-primary/90 px-0"
											variant="link"
											onClick={() =>
												listField.pushValue(emptyProfessionalReference())
											}
										>
											<PlusCircle
												className="size-4 shrink-0"
												data-icon="inline-start"
											/>
											Add Another Reference
										</Button>

										<form.Field name="references">
											{(arrField) =>
												formFieldShowInvalid(
													false,
													arrField.state.meta.isValid,
													submissionAttempts,
												) ? (
													<FieldError errors={arrField.state.meta.errors} />
												) : null
											}
										</form.Field>
									</div>
								)}
							</form.Field>
						</CardContent>
					</Card>
				</div>
			</div>

			<div className="flex items-center justify-between gap-3 pt-2">
				<Button
					type="button"
					variant="outline"
					onClick={onBack}
					disabled={isSubmitting}
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
					{({ isSubmitting: formSubmitting, canSubmit }) => (
						<Button
							type="submit"
							disabled={!canSubmit || isSubmitting || formSubmitting}
							className="gap-2"
						>
							{formSubmitting || isSubmitting ? (
								<Loader2 className="size-4 animate-spin" />
							) : null}
							Continue
							<ArrowRight className="size-4" />
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
