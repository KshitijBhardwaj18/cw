"use client";

import { Action, useAbility } from "@repo/casl";
import { getLabel } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import { ConfigPageErrorState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { AccessBlockedState } from "@/components/general/AccessBlockedState";
import { REQUISITION_TEMPLATE_TYPE_OPTIONS } from "@/constants/requisition-templates";
import { useJobPostingFlowPage } from "@/hooks/use-job-posting-flow-page";
import type { JobPostingFlowMode } from "@/types/job-posting-flow";
import { JobsProgressStepper } from "./JobsProgressStepper";
import { JobDetailsStep } from "./steps/JobDetailsStep";
import { PublishSettingsStep } from "./steps/PublishSettingsStep";
import { ReviewConfirmStep } from "./steps/ReviewConfirmStep";
import { SubmissionSettingsStep } from "./steps/SubmissionSettingsStep";
import { TemplateSelectionStep } from "./steps/TemplateSelectionStep";
import { TypeSelectionStep } from "./steps/TypeSelectionStep";

interface JobsCreateEditPageContentProps {
	mode: JobPostingFlowMode;
	jobId?: string;
	presetTemplateId?: string | null;
}

export function JobsCreateEditPageContent({
	mode,
	jobId,
	presetTemplateId = null,
}: Readonly<JobsCreateEditPageContentProps>) {
	const ability = useAbility();
	const canReadRequisition = ability.can(Action.Read, "Requisition");
	const canUpdateRequisition = ability.can(Action.Update, "Requisition");
	const canCreateRequisition = ability.can(Action.Create, "Requisition");

	const canAccessJobPostingFlow =
		mode === "create"
			? canCreateRequisition
			: canReadRequisition && canUpdateRequisition;

	const page = useJobPostingFlowPage({
		mode,
		jobId,
		presetTemplateId,
		queriesEnabled: canAccessJobPostingFlow,
	});

	const typeLabel = useMemo(() => {
		return (
			getLabel(
				REQUISITION_TEMPLATE_TYPE_OPTIONS,
				page.flowValues.typeSelection.type,
			) ?? page.flowValues.typeSelection.type
		);
	}, [page.flowValues.typeSelection.type]);

	if (mode === "create" && !canCreateRequisition) {
		return (
			<AccessBlockedState
				description="You do not have permission to create job requisitions for this organization."
				backHref="/org/jobs"
				backLabel="Back to Jobs"
			/>
		);
	}

	if (mode === "edit" && (!canReadRequisition || !canUpdateRequisition)) {
		return (
			<AccessBlockedState
				description="You do not have permission to edit job requisitions for this organization."
				backHref="/org/jobs"
				backLabel="Back to Jobs"
			/>
		);
	}

	if (mode === "edit" && page.detailError && !page.isEditHydrated) {
		return (
			<ConfigPageErrorState
				title="Could not load this requisition"
				description="It may have been removed or you may not have access. Return to jobs and try again."
				icon={AlertCircle}
				action={
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="default"
							size="sm"
							onClick={() => void page.refetchDetail()}
						>
							Retry
						</Button>
						<Button variant="outline" size="sm" asChild>
							<Link href="/org/jobs">Back to Jobs</Link>
						</Button>
					</div>
				}
			/>
		);
	}

	if (mode === "edit" && !page.isEditHydrated && page.detailLoading) {
		return (
			<div className="flex h-96 flex-col items-center justify-center gap-4">
				<LoadingScreen message="Loading requisition…" />
			</div>
		);
	}

	if (mode === "create" && page.isCreateFlowBlocked) {
		return (
			<div className="flex h-96 flex-col items-center justify-center gap-4">
				<LoadingScreen message="Loading template…" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title={mode === "create" ? "Create Job Posting" : "Edit Job Posting"}
				total={0}
				itemLabel="job"
				itemLabelPlural="jobs"
				description={`Type: ${typeLabel}`}
				backLink={{ href: "/org/jobs", label: "Back to Jobs" }}
			/>

			<JobsProgressStepper
				currentStep={page.step}
				onStepClick={page.goToStep}
				disableNavigation={page.isRequisitionMutationPending}
			/>

			{page.step === 0 && (
				<TypeSelectionStep
					initialValues={page.flowValues.typeSelection}
					onCancel={page.handleCancel}
					onSubmit={page.handleTypeStepSubmit}
					isPending={page.isPending}
					locked={mode === "edit"}
				/>
			)}
			{page.step === 1 && (
				<TemplateSelectionStep
					type={page.flowValues.typeSelection.type}
					templates={page.templateListForPicker}
					isLoadingTemplates={page.templatesLoading}
					initialValues={page.flowValues.templateSelection}
					onBack={() => page.setStep(0)}
					onCancel={page.handleCancel}
					onSubmit={page.handleTemplateSubmit}
					isPending={page.isPending}
					locked={mode === "edit"}
				/>
			)}
			{page.step === 2 && (
				<JobDetailsStep
					initialValues={page.flowValues.jobDetails}
					onBack={() => page.setStep(1)}
					onCancel={page.handleCancel}
					onSubmit={page.handleJobDetailsStepSubmit}
					isPending={page.isPending}
				/>
			)}
			{page.step === 3 && (
				<SubmissionSettingsStep
					initialValues={page.flowValues.submissionSettings}
					complianceTemplateId={page.flowValues.jobDetails.complianceTemplateId}
					onBack={() => page.setStep(2)}
					onCancel={page.handleCancel}
					onSubmit={page.handleSubmissionSettingsStepSubmit}
					isPending={page.isPending}
				/>
			)}
			{page.step === 4 && (
				<PublishSettingsStep
					initialValues={page.flowValues.publishSettings}
					onBack={() => page.setStep(3)}
					onCancel={page.handleCancel}
					onSubmit={page.handlePublishSettingsStepSubmit}
					isPending={page.isPending}
				/>
			)}
			{page.step === 5 && (
				<ReviewConfirmStep
					mode={mode}
					values={page.flowValues}
					onBack={() => page.setStep(4)}
					onCancel={page.handleCancel}
					onSubmit={page.handleConfirmSubmit}
					isSubmitting={page.isRequisitionMutationPending}
				/>
			)}
		</div>
	);
}
