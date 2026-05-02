"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { useJobPostingReviewConfirmStep } from "@/hooks/job-posting/use-job-posting-review-confirm-step";
import type {
	JobPostingFlowMode,
	JobPostingFlowValues,
} from "@/types/job-posting-flow";
import { ComplianceTemplateDialog } from "../ComplianceTemplateDialog";

interface ReviewConfirmStepProps {
	mode: JobPostingFlowMode;
	values: JobPostingFlowValues;
	onBack: () => void;
	onCancel: () => void;
	onSubmit: () => void;
	isSubmitting?: boolean;
}

export function ReviewConfirmStep({
	mode,
	values,
	onBack,
	onCancel,
	onSubmit,
	isSubmitting = false,
}: ReviewConfirmStepProps) {
	const {
		complianceOpen,
		setComplianceOpen,
		acceptanceCriteriaLabels,
		locationLabel,
		departmentLabel,
		occupationLabel,
		specialtyLabel,
		hiringManagerLabel,
		submissionTypeLabel,
		vendorAccessLabel,
		publishModeLabel,
		billRateLabel,
		incentiveAmountLabel,
		requisitionTypeLabel,
		shiftTypeLabel,
		interviewRequiredLabel,
		templateName,
		complianceTemplateLabel,
		handleFormSubmit,
	} = useJobPostingReviewConfirmStep({ values, onSubmit, isSubmitting });

	return (
		<Card>
			<CardHeader>
				<CardTitle>Review Job Posting</CardTitle>
				<CardDescription>Review all details before publishing</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<form className="space-y-6" onSubmit={handleFormSubmit}>
					<div className="rounded-lg border p-4">
						<h3 className="mb-3 font-semibold">Requisition Details</h3>
						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<DetailItem
								label="Requisition Type"
								value={requisitionTypeLabel}
							/>
							<DetailItem label="Selected Template" value={templateName} />
							<DetailItem
								label="Requisition Name"
								value={values.jobDetails.requisitionName}
							/>
							<DetailItem label="Occupation" value={occupationLabel} />
							<DetailItem label="Specialty" value={specialtyLabel} />
							<DetailItem label="Department" value={departmentLabel} />
							<DetailItem label="Location" value={locationLabel} />
							<DetailItem
								label="Unit Name"
								value={values.jobDetails.unitName ?? "—"}
							/>
						</div>
						<div className="mt-4 space-y-1">
							<p className="text-muted-foreground text-sm">Job Description</p>
							<p className="text-sm font-medium">
								{values.jobDetails.description}
							</p>
						</div>
					</div>

					<div className="rounded-lg border p-4">
						<h3 className="mb-3 font-semibold">Job Definition</h3>
						<p className="text-muted-foreground text-sm font-medium">
							Shift &amp; Schedule
						</p>
						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<DetailItem
								label="Start Date"
								value={values.jobDetails.startDate || "—"}
							/>
							<DetailItem
								label="End Date"
								value={values.jobDetails.endDate || "—"}
							/>
							<DetailItem
								label="Length (Weeks)"
								value={`${values.jobDetails.lengthWeeks} weeks`}
							/>
							<DetailItem label="Shift Type" value={shiftTypeLabel} />
							<DetailItem
								label="Start Time"
								value={values.jobDetails.startTime || "—"}
							/>
							<DetailItem
								label="End Time"
								value={values.jobDetails.endTime || "—"}
							/>
							<DetailItem
								label="Shift Hours"
								value={`${values.jobDetails.shiftHours} hours`}
							/>
							<DetailItem
								label="Shifts Per Week"
								value={String(values.jobDetails.shiftsPerWeek)}
							/>
							<DetailItem
								label="Hours Per Week"
								value={`${values.jobDetails.hoursPerWeek} hours`}
							/>
						</div>

						<p className="text-muted-foreground mt-6 text-sm font-medium">
							Compensation &amp; Hiring
						</p>
						<div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
							<DetailItem label="Bill Rate" value={billRateLabel} />
							<DetailItem
								label="# of Open Positions"
								value={String(values.jobDetails.numberOfPositions)}
							/>
							<DetailItem
								label="Incentive Type"
								value={values.jobDetails.incentiveType || "—"}
							/>
							<DetailItem label="Incentives" value={incentiveAmountLabel} />
							<DetailItem
								label="Interview Required"
								value={interviewRequiredLabel}
							/>
							<DetailItem label="Hiring Manager" value={hiringManagerLabel} />
						</div>
					</div>

					<div className="rounded-lg border p-4">
						<h3 className="mb-3 font-semibold">Compliance</h3>
						<div className="space-y-2">
							<DetailItem
								label="Compliance Template"
								value={complianceTemplateLabel}
							/>
							<p className="text-primary text-sm font-medium">
								<button
									type="button"
									className="text-primary text-sm font-medium"
									onClick={() => setComplianceOpen(true)}
								>
									View Compliance Details →
								</button>
							</p>
						</div>
					</div>

					<div className="rounded-lg border p-4">
						<h3 className="mb-3 font-semibold">Submission Settings</h3>
						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<DetailItem label="Workflow Type" value={submissionTypeLabel} />
							<DetailItem
								label="Vendor Submission Rule"
								value={vendorAccessLabel}
							/>
							<DetailItem
								label="Acceptance Criteria"
								value={
									acceptanceCriteriaLabels.length === 0
										? "None selected"
										: `${acceptanceCriteriaLabels.length} selected: ${acceptanceCriteriaLabels.join(", ")}`
								}
							/>
						</div>
					</div>

					<div className="rounded-lg border p-4">
						<h3 className="mb-3 font-semibold">Publish Settings</h3>
						<div className="space-y-2">
							<DetailItem label="Publish Mode" value={publishModeLabel} />
							{values.publishSettings.publishMode ===
								"SCHEDULE_PUBLISH_DATE" && (
								<>
									<DetailItem
										label="Publish Date"
										value={values.publishSettings.scheduledPublishDate || "—"}
									/>
									<DetailItem
										label="Publish Time"
										value={values.publishSettings.scheduledPublishTime || "—"}
									/>
								</>
							)}
						</div>
					</div>

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={onBack}
							disabled={isSubmitting}
						>
							Back
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting
								? "Saving…"
								: mode === "create"
									? "Create Job Posting"
									: "Update Job Posting"}
						</Button>
					</div>
				</form>

				<ComplianceTemplateDialog
					open={complianceOpen}
					onOpenChange={setComplianceOpen}
					complianceTemplateId={values.jobDetails.complianceTemplateId}
				/>
			</CardContent>
		</Card>
	);
}
