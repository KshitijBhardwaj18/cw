"use client";

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
import { RadioGroup } from "@repo/ui/components/radio-group";
import { RadioOptionCard } from "@repo/ui/components/radio-option-card";
import { TimePicker } from "@repo/ui/components/time-picker";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { formFieldShowInvalid } from "@repo/ui/lib/form-field-display";
import { useStore } from "@tanstack/react-form";
import { JOB_POSTING_PUBLISH_MODE_OPTIONS } from "@/constants/job-posting-flow";
import { useJobPostingPublishSettingsStepForm } from "@/hooks/job-posting/use-job-posting-publish-settings-step-form";
import type { JobPostingPublishValues } from "@/schemas/job-posting-publish.schema";

interface PublishSettingsStepProps {
	initialValues: JobPostingPublishValues;
	onBack: () => void;
	onCancel: () => void;
	onSubmit: (values: JobPostingPublishValues) => void;
	isPending?: boolean;
}

export function PublishSettingsStep({
	initialValues,
	onBack,
	onCancel,
	onSubmit,
	isPending = false,
}: PublishSettingsStepProps) {
	const { form, lockFields, handleFormSubmit } =
		useJobPostingPublishSettingsStepForm({
			initialValues,
			onSubmit,
			isPending,
		});

	const submissionAttempts = useStore(
		form.store,
		(s) => s.submissionAttempts ?? 0,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Publish Settings</CardTitle>
				<CardDescription>
					Choose how and when to publish this job posting
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-6" onSubmit={handleFormSubmit}>
					<form.Field name="publishMode">
						{(field) => {
							const isInvalid = formFieldShowInvalid(
								field.state.meta.isTouched,
								field.state.meta.isValid,
								submissionAttempts,
							);
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>
										Publish Mode <RequiredStar />
									</FieldLabel>
									<RadioGroup
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(value) =>
											field.handleChange(
												value as JobPostingPublishValues["publishMode"],
											)
										}
										aria-invalid={isInvalid}
										disabled={lockFields}
									>
										{JOB_POSTING_PUBLISH_MODE_OPTIONS.map((option) => (
											<RadioOptionCard
												key={option.id}
												id={option.id}
												value={option.value}
												label={option.label}
												description={option.description}
												selected={field.state.value === option.value}
												disabled={lockFields}
											/>
										))}
									</RadioGroup>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Subscribe selector={(state) => state.values.publishMode}>
						{(publishMode) =>
							publishMode === "SCHEDULE_PUBLISH_DATE" ? (
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<form.Field name="scheduledPublishDate">
										{(field) => {
											const isInvalid = formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											);
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel>
														Publish Date <RequiredStar />
													</FieldLabel>
													<DatePicker
														value={field.state.value ?? ""}
														onChange={(value) =>
															field.handleChange(value || "")
														}
														onBlur={field.handleBlur}
														placeholder="Select publish date"
														aria-invalid={isInvalid}
														disabled={lockFields}
													/>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									</form.Field>

									<form.Field name="scheduledPublishTime">
										{(field) => {
											const isInvalid = formFieldShowInvalid(
												field.state.meta.isTouched,
												field.state.meta.isValid,
												submissionAttempts,
											);
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel>
														Publish Time <RequiredStar />
													</FieldLabel>
													<TimePicker
														value={field.state.value ?? ""}
														onChange={(value) =>
															field.handleChange(value || "")
														}
														onBlur={field.handleBlur}
														placeholder="Select publish time"
														aria-invalid={isInvalid}
														disabled={lockFields}
													/>
													{isInvalid && (
														<FieldError errors={field.state.meta.errors} />
													)}
												</Field>
											);
										}}
									</form.Field>
								</div>
							) : null
						}
					</form.Subscribe>

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={onBack}
							disabled={isPending}
						>
							Back
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={form.state.isSubmitting || isPending}
						>
							{form.state.isSubmitting || isPending
								? "Saving..."
								: "Next \u2192"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
