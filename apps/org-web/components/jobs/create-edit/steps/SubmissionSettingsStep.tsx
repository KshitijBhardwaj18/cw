"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import {
	MultiSelect,
	MultiSelectContent,
	MultiSelectItem,
	MultiSelectTrigger,
	MultiSelectValue,
} from "@repo/ui/components/multi-select";
import { RadioGroup } from "@repo/ui/components/radio-group";
import { RadioOptionCard } from "@repo/ui/components/radio-option-card";
import { Separator } from "@repo/ui/components/separator";
import { Textarea } from "@repo/ui/components/textarea";
import { CustomTable } from "@repo/ui/general/CustomTable";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { cn } from "@repo/ui/lib/utils";
import {
	JOB_POSTING_SUBMISSION_TYPE_OPTIONS,
	JOB_POSTING_VENDOR_ACCESS_OPTIONS,
} from "@/constants/job-posting-flow";
import { useJobPostingSubmissionSettingsStepForm } from "@/hooks/job-posting/use-job-posting-submission-settings-step-form";
import type { JobPostingSubmissionValues } from "@/schemas/job-posting-submission.schema";

interface SubmissionSettingsStepProps {
	initialValues: JobPostingSubmissionValues;
	complianceTemplateId: string;
	onBack: () => void;
	onCancel: () => void;
	onSubmit: (values: JobPostingSubmissionValues) => void;
	isPending?: boolean;
}

export function SubmissionSettingsStep({
	initialValues,
	complianceTemplateId,
	onBack,
	onCancel,
	onSubmit,
	isPending = false,
}: SubmissionSettingsStepProps) {
	const {
		form,
		lockFields,
		vendorAccess,
		vendorsQuery,
		acceptanceCriteriaColumns,
		acceptanceCriteriaRows,
		acceptanceCriteriaSummary,
		selectedIdsNotInCatalog,
		handleFormSubmit,
		isChecklistLoading,
		hasNoChecklistId,
	} = useJobPostingSubmissionSettingsStepForm({
		initialValues,
		complianceTemplateId,
		onSubmit,
		isPending,
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Submission Settings</CardTitle>
				<CardDescription>
					Configure workflow settings, vendor submission rules and acceptance
					criteria
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-6" onSubmit={handleFormSubmit}>
					<h3 className="font-semibold">Workflow Settings</h3>
					<form.Field name="submissionType">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>
										Submission Type <RequiredStar />
									</FieldLabel>
									<RadioGroup
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(value) =>
											field.handleChange(
												value as JobPostingSubmissionValues["submissionType"],
											)
										}
										aria-invalid={isInvalid}
										disabled={lockFields}
									>
										{JOB_POSTING_SUBMISSION_TYPE_OPTIONS.map((option) => (
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

					<Separator />
					<h3 className="font-semibold">Vendor Submission Rules</h3>

					<form.Field name="vendorAccess">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>
										Vendor Access <RequiredStar />
									</FieldLabel>
									<RadioGroup
										value={field.state.value}
										onBlur={field.handleBlur}
										onValueChange={(value) => {
											const v =
												value as JobPostingSubmissionValues["vendorAccess"];
											field.handleChange(v);
											if (v === "ALL_VENDORS") {
												form.setFieldValue("selectedVendorIds", []);
											}
										}}
										aria-invalid={isInvalid}
										disabled={lockFields}
									>
										{JOB_POSTING_VENDOR_ACCESS_OPTIONS.map((option) => (
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

					{vendorAccess === "SELECTED_VENDORS" && (
						<form.Field
							name="selectedVendorIds"
							validators={{
								onSubmit: ({ value }) => {
									if (!value || value.length === 0) {
										return "Select at least one vendor";
									}
								},
							}}
						>
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel>Select Vendors</FieldLabel>
										<MultiSelect
											values={field.state.value ?? []}
											onValuesChange={(v) => field.handleChange(v)}
										>
											<MultiSelectTrigger
												className={cn(
													"h-auto min-h-10 w-full justify-between py-2 whitespace-normal",
													lockFields && "pointer-events-none opacity-60",
												)}
												aria-invalid={isInvalid}
												disabled={lockFields}
											>
												<MultiSelectValue placeholder="Choose vendors…" />
											</MultiSelectTrigger>
											<MultiSelectContent>
												{(vendorsQuery.data ?? []).map((v) => (
													<MultiSelectItem key={v.id} value={v.id}>
														{v.name}
													</MultiSelectItem>
												))}
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

					<Separator />

					<form.Field name="notesForVendors">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel>Notes for Vendors (Optional)</FieldLabel>
									<Textarea
										rows={3}
										placeholder="Add any special instructions for vendors..."
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										disabled={lockFields}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>
					<Separator />
					<Field>
						<FieldLabel>Acceptance Criteria</FieldLabel>
						<p className="text-muted-foreground text-sm">
							Items and submission vs placement follow the compliance checklist
							from this job&apos;s requisition template. You can turn submission
							items on or off; placement items stay required at placement.
							{hasNoChecklistId
								? " No checklist is linked in job details; showing all active catalog items instead."
								: ""}
						</p>
						{isChecklistLoading ? (
							<p className="text-muted-foreground mt-2 text-sm">
								Loading checklist…
							</p>
						) : null}
						<div className="mt-3 flex min-h-0 max-h-[min(28rem,70vh)] flex-col overflow-hidden rounded-lg border">
							<div className="min-h-0 flex-1 overflow-auto">
								<CustomTable
									className="[&_thead_th]:h-auto [&_thead_th]:min-h-10 [&_thead_th]:py-2"
									columns={acceptanceCriteriaColumns}
									data={acceptanceCriteriaRows}
									enableSorting={false}
									emptyState={
										isChecklistLoading ? (
											<p className="text-muted-foreground py-8 text-center text-sm">
												Loading checklist…
											</p>
										) : (
											<p className="text-muted-foreground py-8 text-center text-sm">
												{hasNoChecklistId
													? "No compliance items in the catalog."
													: "No active items on this checklist."}
											</p>
										)
									}
								/>
							</div>
							<div className="flex shrink-0 gap-4 border-t px-4 py-4">
								<div className="w-full rounded-lg border px-4 py-3">
									<p className="text-muted-foreground text-xs">Selected</p>
									<p className="text-lg font-semibold">
										{acceptanceCriteriaSummary.total}
									</p>
								</div>
								<div className="w-full rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
									<p className="text-primary text-xs">For Submission</p>
									<p className="text-primary text-lg font-semibold">
										{acceptanceCriteriaSummary.forSubmission}
									</p>
								</div>
								<div className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
									<p className="text-emerald-600 text-xs dark:text-emerald-400">
										For Placement
									</p>
									<p className="text-emerald-600 text-lg font-semibold dark:text-emerald-400">
										{acceptanceCriteriaSummary.forPlacement}
									</p>
								</div>
							</div>
						</div>
						{selectedIdsNotInCatalog.length > 0 && (
							<div className="mt-3 space-y-2">
								<p className="text-muted-foreground text-xs font-medium uppercase">
									No longer in catalog
								</p>
								{selectedIdsNotInCatalog.map((id) => (
									<div
										key={id}
										className="flex items-center gap-2 rounded-md border border-dashed p-2 opacity-80"
									>
										<Checkbox checked disabled id={`criteria-orphan-${id}`} />
										<span className="text-muted-foreground text-sm">
											Selected criterion ({id.slice(0, 8)}…) is no longer in the
											active catalog
										</span>
									</div>
								))}
							</div>
						)}
					</Field>

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
