"use client";

import { Action, subjectInstance, useAbility } from "@repo/casl";
import {
	formatIsoDateUtc,
	getLabel,
	getRequisitionStatusLabel,
	getRequisitionStatusVariant,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import { MetricCard } from "@repo/ui/general/MetricCard";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import {
	Calendar,
	Clock,
	DollarSign,
	FileText,
	MapPin,
	Pencil,
	UserPlus,
	Users,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { AccessBlockedState } from "@/components/general/AccessBlockedState";
import { LockableActionButton } from "@/components/general/LockableActionButton";
import { getInterviewTypeLabel } from "@/constants/interview-type-labels";
import { JOB_POSTING_SUBMISSION_TYPE_OPTIONS } from "@/constants/job-posting-flow";
import {
	ACTIVE_SUBMISSION_STAGES,
	SUBMISSION_STAGE_TABS,
	type SubmissionStageKey,
} from "@/constants/submissions";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import {
	useCancelRequisition,
	useRequisitionDetail,
} from "@/queries/requisitions.queries";
import { useJobSubmissionStageCounts } from "@/queries/submissions.queries";
import type { RequisitionDetailResponse } from "@/services/requisitions.service";
import {
	isJobActionLocked,
	jobActionLockedReason,
} from "@/utils/job-status-actions";
import {
	formatBillRateDisplay,
	formatHoursPerWeek,
	formatScheduleFromTimes,
	formatShiftTypeHuman,
} from "@/utils/submission-detail-format";
import { JobCandidateSubmissionsSection } from "./JobCandidateSubmissionsSection";
import { JobDetailsMetadataCards } from "./JobDetailsMetadataCards";
import type { JobOfferAdjustmentDefaults } from "./JobOfferAdjustmentDialog";
import { JobPostingDescriptionTabsCard } from "./JobPostingDescriptionTabsCard";
import { JobRequisitionDetailsCard } from "./JobRequisitionDetailsCard";

function statusBadge(status: Readonly<string>) {
	return (
		<Badge variant={getRequisitionStatusVariant(status)}>
			{getRequisitionStatusLabel(status)}
		</Badge>
	);
}

function publishVisibilityLabel(
	mode: RequisitionDetailResponse["publishSettings"]["publishMode"],
): string {
	switch (mode) {
		case "PUBLISH_IMMEDIATELY":
			return "Public";
		case "SAVE_AS_DRAFT":
			return "Draft";
		case "SCHEDULE_PUBLISH_DATE":
			return "Scheduled";
		default:
			return "—";
	}
}

function postedDateLabel(
	publish: RequisitionDetailResponse["publishSettings"],
	fmtShortDate: (iso: string | Date | null | undefined) => string,
): string {
	const dateStr =
		publish.publishMode === "SCHEDULE_PUBLISH_DATE"
			? publish.scheduledPublishDate
			: publish.publishMode === "PUBLISH_IMMEDIATELY"
				? publish.publishedAt
				: null;
	if (!dateStr) return "—";
	return fmtShortDate(dateStr);
}

export interface JobDetailsPageContentProps {
	jobId: string;
}

export function JobDetailsPageContent({
	jobId,
}: Readonly<JobDetailsPageContentProps>) {
	const { fmtShortDate } = useUserTimezone();
	const router = useRouter();
	const ability = useAbility();
	const [closeDialogOpen, setCloseDialogOpen] = useState(false);

	const { data, isLoading, isError, error } = useRequisitionDetail(jobId);
	const { data: stageCounts } = useJobSubmissionStageCounts(jobId, {
		enabled: !!jobId,
	});

	const cancelJob = useCancelRequisition();

	const isInterviewRequired =
		data?.jobDetails.interviewRequired !== "NO_INTERVIEW";

	const allowedSubmissionStages = useMemo<SubmissionStageKey[]>(
		() =>
			SUBMISSION_STAGE_TABS.filter(({ stage }) => {
				if (
					!isInterviewRequired &&
					(stage === "INTERVIEW_SCHEDULED" || stage === "INTERVIEW_COMPLETED")
				) {
					return false;
				}
				return ability.can(
					Action.List,
					subjectInstance("Submission", { stage }),
				);
			}).map(({ stage }) => stage),
		[ability, isInterviewRequired],
	);

	const canReadJob = ability.can(Action.Read, "Requisition");
	const canUpdateJob = ability.can(Action.Update, "Requisition");
	const canListAnySubmission = allowedSubmissionStages.length > 0;

	const totalApplications = useMemo(() => {
		if (!stageCounts) return 0;
		return ACTIVE_SUBMISSION_STAGES.reduce(
			(sum, s) => sum + (stageCounts[s] ?? 0),
			0,
		);
	}, [stageCounts]);

	const positionsAccepted = stageCounts?.ACCEPTED ?? 0;
	const positionsOffered = stageCounts?.OFFERED ?? 0;
	const openSlots = data
		? Math.max(
				0,
				data.jobDetails.numberOfPositions -
					positionsAccepted -
					positionsOffered,
			)
		: 0;

	const scheduleDisplay = useMemo(() => {
		if (!data) return "—";
		return formatScheduleFromTimes(
			data.jobDetails.startTime,
			data.jobDetails.endTime,
			data.jobDetails.shiftsPerWeek,
		);
	}, [data]);

	const submissionTypeLabel = useMemo(() => {
		if (!data) return "—";
		return getLabel(
			JOB_POSTING_SUBMISSION_TYPE_OPTIONS.map((o) => ({
				value: o.value,
				label: o.label,
			})),
			data.submissionSettings.submissionType,
		);
	}, [data]);

	const jobOfferAdjustmentDefaults =
		useMemo((): JobOfferAdjustmentDefaults | null => {
			if (!data) return null;
			const start = formatIsoDateUtc(data.jobDetails.startDate);
			const end = formatIsoDateUtc(data.jobDetails.endDate);
			return {
				startDate: start === "—" ? "" : start,
				endDate: end === "—" ? "" : end,
				billRate: data.jobDetails.billRate ?? null,
			};
		}, [data]);

	const handleCloseJob = useCallback(() => {
		cancelJob.mutate(jobId, {
			onSuccess: () => {
				toast.success("Job closed.");
				setCloseDialogOpen(false);
				router.push("/org/jobs");
			},
			onError: (e) => {
				toast.error(
					e instanceof Error ? e.message : "Could not close this job.",
				);
			},
		});
	}, [cancelJob, jobId, router]);

	if (!canReadJob) {
		return (
			<div className="space-y-6">
				<PageBackLink href="/org/jobs">Back to Jobs</PageBackLink>
				<AccessBlockedState
					title="No access"
					description="You do not have permission to view this job."
				/>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex min-h-[360px] items-center justify-center rounded-xl border border-dashed">
				<LoadingScreen message="Loading job…" />
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="space-y-6">
				<PageBackLink href="/org/jobs">Back to Jobs</PageBackLink>
				<ConfigPageErrorState
					className="rounded-xl border border-dashed py-16"
					title="Could not load this job"
					description={
						error instanceof Error
							? error.message
							: "The job was not found or you may not have access."
					}
				/>
			</div>
		);
	}

	const locName = data.locationName ?? "—";
	const deptName = data.departmentName ?? "—";
	const occupationLabel = data.occupationName ?? "—";
	const specialtyLabel = data.specialtyName ?? "—";
	const hiringManagerName = data.hiringManagerName ?? "—";
	const templateName = data.templateName?.trim() || "Requisition template";
	const title = data.jobDetails.requisitionName || "Job posting";

	const startLabel = fmtShortDate(data.jobDetails.startDate);

	return (
		<div className="space-y-8">
			<PageBackLink href="/org/jobs">Back to Jobs</PageBackLink>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0 space-y-2">
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
						{title}
					</h1>
					<div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
						{statusBadge(data.status)}
						<span className="inline-flex items-center gap-1.5">
							<MapPin className="size-4 shrink-0" />
							{locName}
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Calendar className="size-4 shrink-0" />
							Target start {startLabel}
						</span>
					</div>
					<p className="text-muted-foreground text-sm">
						{occupationLabel}
						{specialtyLabel && specialtyLabel !== "—"
							? ` · ${specialtyLabel}`
							: ""}
						{deptName !== "—" ? ` · ${deptName}` : ""}
					</p>
				</div>
				<div className="flex shrink-0 flex-wrap gap-2">
					{canUpdateJob ? (
						<>
							<LockableActionButton
								type="button"
								variant="outline"
								locked={isJobActionLocked(data.status)}
								lockReason={jobActionLockedReason(data.status)}
								onClick={() => router.push(`/org/jobs/${jobId}/edit`)}
							>
								<Pencil className="size-4" />
								Edit
							</LockableActionButton>
							<LockableActionButton
								type="button"
								variant="outline"
								className="border-destructive/40 text-destructive hover:bg-destructive/5"
								locked={isJobActionLocked(data.status)}
								lockReason={jobActionLockedReason(data.status)}
								onClick={() => setCloseDialogOpen(true)}
							>
								<XCircle className="size-4" />
								Close job
							</LockableActionButton>
						</>
					) : null}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				<MetricCard
					title="Open positions"
					value={openSlots}
					icon={UserPlus}
					variant="default"
				/>
				<MetricCard
					title="Positions filled"
					value={positionsAccepted}
					icon={Users}
					variant="success"
				/>
				<MetricCard
					title="Total applications"
					value={totalApplications}
					icon={FileText}
					variant="info"
				/>
				<MetricCard
					title="Bill rate"
					value={formatBillRateDisplay(data.jobDetails.billRate)}
					icon={DollarSign}
					variant="default"
				/>
				<MetricCard
					title="Shift type"
					value={formatShiftTypeHuman(String(data.jobDetails.shiftType))}
					icon={Clock}
					variant="default"
				/>
			</div>

			{canListAnySubmission ? (
				<JobCandidateSubmissionsSection
					jobId={jobId}
					allowedStages={allowedSubmissionStages}
					isInterviewRequired={isInterviewRequired}
					offerDefaults={jobOfferAdjustmentDefaults}
				/>
			) : (
				<ConfigPageEmptyState
					hasSearch={false}
					emptyTitle="Submissions are hidden"
					emptyMessage="You do not have permission to view submissions for any stage."
					icon={FileText}
				/>
			)}

			<JobPostingDescriptionTabsCard
				description={data.jobDetails.description}
				requirements={data.requirementNames}
				benefits={data.jobDetails.benefitsPerks ?? []}
			/>

			<JobRequisitionDetailsCard
				location={locName}
				department={deptName}
				occupation={occupationLabel}
				specialty={specialtyLabel}
				billRate={formatBillRateDisplay(data.jobDetails.billRate)}
				vendorRate="—"
				startDate={fmtShortDate(data.jobDetails.startDate)}
				endDate={fmtShortDate(data.jobDetails.endDate)}
				shiftType={formatShiftTypeHuman(String(data.jobDetails.shiftType))}
				shiftHours={
					data.jobDetails.shiftHours != null
						? `${data.jobDetails.shiftHours} hours`
						: "—"
				}
				hoursPerWeek={formatHoursPerWeek(data.jobDetails.hoursPerWeek)}
				schedule={scheduleDisplay}
				interviewRequired={getInterviewTypeLabel(
					data.jobDetails.interviewRequired,
				)}
			/>

			<JobDetailsMetadataCards
				templateId={data.templateId}
				templateName={templateName}
				occupation={occupationLabel}
				department={deptName}
				location={locName}
				hiringManager={hiringManagerName}
				startDate={fmtShortDate(data.jobDetails.startDate)}
				endDate={fmtShortDate(data.jobDetails.endDate)}
				billRate={formatBillRateDisplay(data.jobDetails.billRate)}
				shiftType={formatShiftTypeHuman(String(data.jobDetails.shiftType))}
				hoursPerWeek={formatHoursPerWeek(data.jobDetails.hoursPerWeek)}
				schedule={scheduleDisplay}
				visibility={publishVisibilityLabel(data.publishSettings.publishMode)}
				submissionRule={submissionTypeLabel}
				postedOrPublishLabel={postedDateLabel(
					data.publishSettings,
					fmtShortDate,
				)}
			/>

			<CustomAlertDialog
				isOpen={closeDialogOpen}
				onClose={() => setCloseDialogOpen(false)}
				onConfirm={handleCloseJob}
				isLoading={cancelJob.isPending}
				title="Close this job posting?"
				description="Closing will stop new candidate activity for this requisition. You can still access it from the jobs list for reference."
				cancelText="Cancel"
				confirmText="Close job"
			/>
		</div>
	);
}
