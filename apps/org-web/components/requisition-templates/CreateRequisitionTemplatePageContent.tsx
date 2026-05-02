"use client";

import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useRequisitionTemplateBuilderPage } from "@/hooks/use-requisition-template-builder-page";
import { CompensationHiringForm } from "./CompensationHiringForm";
import { ComplianceChecklistForm } from "./ComplianceChecklistForm";
import { RequisitionTemplateProgress } from "./RequisitionTemplateProgress";
import { ShiftsScheduleForm } from "./ShiftsScheduleForm";
import { SubmissionRulesForm } from "./SubmissionRulesForm";
import { TemplateDetailsForm } from "./TemplateDetailsForm";

const TEMPLATE_DETAILS_STEP = 0;
const SHIFTS_SCHEDULE_STEP = 1;
const COMPENSATION_STEP = 2;
const COMPLIANCE_STEP = 3;
const SUBMISSION_RULES_STEP = 4;

type CreateRequisitionTemplatePageContentProps = {
	forcedMode?: "create" | "edit" | "view";
	templateId?: string;
};

export function CreateRequisitionTemplatePageContent({
	forcedMode,
	templateId: templateIdProp,
}: CreateRequisitionTemplatePageContentProps = {}) {
	const page = useRequisitionTemplateBuilderPage({
		forcedMode,
		templateId: templateIdProp,
	});

	if (page.isInvalidType) {
		return (
			<div className="space-y-6">
				<PageBackLink href="/org/requisition-templates">
					Back to Requisition Templates
				</PageBackLink>
				<p className="text-muted-foreground">
					Invalid or missing template type. Please select a type from the
					requisition templates page.
				</p>
				<Link
					href="/org/requisition-templates"
					className="text-primary text-sm font-medium underline-offset-4 hover:underline"
				>
					Go to Requisition Templates
				</Link>
			</div>
		);
	}

	if (page.isLoadingTemplate) {
		return (
			<div className="space-y-6">
				<PageBackLink href="/org/requisition-templates">
					Back to Requisition Templates
				</PageBackLink>
				<p className="text-muted-foreground text-sm">
					Loading template details...
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title={page.headerTitle}
				total={0}
				itemLabel="template"
				itemLabelPlural="templates"
				description={page.typeLabel}
				backLink={{
					href: "/org/requisition-templates",
					label: "Back to Requisition Templates",
				}}
				actions={
					forcedMode === "view" && templateIdProp
						? [
								{
									key: "use-template-job",
									icon: <FileText className="size-4" />,
									label: "Use for new job",
									href: `/org/jobs/create?templateId=${templateIdProp}`,
								},
							]
						: undefined
				}
			/>

			<RequisitionTemplateProgress currentStep={page.currentStep} />

			{page.currentStep === TEMPLATE_DETAILS_STEP && (
				<TemplateDetailsForm
					key={`details-${page.templateIdForKey}`}
					onSubmit={page.handleTemplateDetailsSubmit}
					onCancel={page.handleCancel}
					isPending={page.isPending}
					initialValues={page.initialTemplateDetails}
					readOnly={page.isViewMode}
				/>
			)}

			{page.currentStep === SHIFTS_SCHEDULE_STEP && (
				<ShiftsScheduleForm
					key={`schedule-${page.templateIdForKey}`}
					onSubmit={page.handleShiftsScheduleSubmit}
					onCancel={page.handleCancel}
					onBack={page.handleBackToTemplateDetails}
					isPending={page.isPending}
					initialValues={page.initialShiftsSchedule}
					readOnly={page.isViewMode}
				/>
			)}

			{page.currentStep === COMPENSATION_STEP && (
				<CompensationHiringForm
					key={`comp-${page.templateIdForKey}`}
					onSubmit={page.handleCompensationSubmit}
					onCancel={page.handleCancel}
					onBack={page.handleBackToShiftsSchedule}
					isPending={page.isPending}
					initialValues={page.initialCompensation}
					readOnly={page.isViewMode}
				/>
			)}

			{page.currentStep === COMPLIANCE_STEP && (
				<ComplianceChecklistForm
					key={`comp-check-${page.templateIdForKey}`}
					onSubmit={page.handleComplianceSubmit}
					onCancel={page.handleCancel}
					onBack={page.handleBackToCompensation}
					isPending={page.isPending}
					checklists={page.checklistCards}
					itemOptions={page.checklistItemOptions}
					initialValues={page.initialCompliance}
					readOnly={page.isViewMode}
				/>
			)}

			{page.currentStep === SUBMISSION_RULES_STEP && (
				<SubmissionRulesForm
					key={`sub-${page.templateIdForKey}`}
					onSubmit={page.handleSubmissionRulesSubmit}
					onCancel={page.handleCancel}
					onBack={page.handleBackToCompliance}
					isPending={page.isPending}
					vendors={page.vendors}
					initialValues={page.submissionInitialValues}
					readOnly={page.isViewMode}
				/>
			)}
		</div>
	);
}
