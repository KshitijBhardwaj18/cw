"use client";

import { Action, subjectInstance, useAbility } from "@repo/casl";
import type {
	OrgDepartmentOption,
	OrgLocationOption,
	OrgOccupationOption,
} from "@repo/shared";
import { getLabel } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { CustomAlertDialog } from "@repo/ui/general/CustomAlertDialog";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import { MetricCard } from "@repo/ui/general/MetricCard";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { AccessBlockedState } from "@/components/general/AccessBlockedState";
import { getInterviewTypeLabel } from "@/constants/interview-type-labels";
import { JOB_POSTING_SUBMISSION_TYPE_OPTIONS } from "@/constants/job-posting-flow";
import {
	SUBMISSION_STAGE_TABS,
	type SubmissionStageKey,
} from "@/constants/submissions";
import { useOrgContext } from "@/contexts/org-context";
import { useComplianceChecklist } from "@/queries/compliance-checklist.queries";
import { useOrgMembersForPicker } from "@/queries/organizations.queries";
import { useRequisitionTemplate } from "@/queries/requisition-templates.queries";
import {
	useCancelRequisition,
	useRequisitionDetail,
} from "@/queries/requisitions.queries";
import { shiftTemplateKeys } from "@/queries/shift-templates.queries";
import { useJobSubmissionStageCounts } from "@/queries/submissions.queries";
import type { RequisitionDetailResponse } from "@/services/requisitions.service";
import { ShiftTemplatesService } from "@/services/shift-templates.service";
import {
	formatBillRateDisplay,
	formatHoursPerWeek,
	formatIsoDateOnly,
	formatScheduleFromTimes,
	formatShiftTypeHuman,
} from "@/utils/submission-detail-format";
import { JobCandidateSubmissionsSection } from "./JobCandidateSubmissionsSection";
import { JobDetailsMetadataCards } from "./JobDetailsMetadataCards";
import { JobPostingDescriptionTabsCard } from "./JobPostingDescriptionTabsCard";
import { JobRequisitionDetailsCard } from "./JobRequisitionDetailsCard";

function resolveLocationName(
	locations: OrgLocationOption[] | undefined,
	id: string,
): string {
	if (!locations?.length) {
		return "—";
	}
	return locations.find((l) => l.id === id)?.name ?? "—";
}

function resolveDepartmentName(
	departments: OrgDepartmentOption[] | undefined,
	id: string,
): string {
	if (!departments?.length) {
		return "—";
	}
	return departments.find((d) => d.id === id)?.name ?? "—";
}

function resolveOccupationAndSpecialty(
	occupations: OrgOccupationOption[] | undefined,
	occupationId: string,
	specialtyOrgId: string,
): { occupation: string; specialty: string } {
	if (!occupations?.length) {
		return { occupation: "—", specialty: "—" };
	}
	const occ = occupations.find(
		(o) => o.organizationOccupationId === occupationId || o.id === occupationId,
	);
	if (!occ) {
		return { occupation: "—", specialty: "—" };
	}
	let specialty = "—";
	if (specialtyOrgId?.trim()) {
		const s = occ.organizationSpecialties?.find((x) => x.id === specialtyOrgId);
		specialty = s?.name ?? "—";
	}
	return { occupation: occ.name, specialty };
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
): string {
	if (
		publish.publishMode === "SCHEDULE_PUBLISH_DATE" &&
		publish.scheduledPublishDate
	) {
		try {
			return format(
				parseISO(`${publish.scheduledPublishDate}T12:00:00`),
				"MMM d, yyyy",
			);
		} catch {
			return "—";
		}
	}
	return "—";
}

export interface JobDetailsPageContentProps {
	jobId: string;
}

export function JobDetailsPageContent({ jobId }: JobDetailsPageContentProps) {
	const router = useRouter();
	const { id: orgId } = useOrgContext();
	const ability = useAbility();
	const [closeDialogOpen, setCloseDialogOpen] = useState(false);

	const { data, isLoading, isError, error } = useRequisitionDetail(
		orgId,
		jobId,
	);
	const { data: stageCounts } = useJobSubmissionStageCounts(orgId, jobId, {
		enabled: !!orgId && !!jobId,
	});

	const { data: locations = [] } = useQuery({
		queryKey: shiftTemplateKeys.locations(),
		queryFn: () => ShiftTemplatesService.getLocations(),
	});
	const { data: departments = [] } = useQuery({
		queryKey: shiftTemplateKeys.departments(),
		queryFn: () => ShiftTemplatesService.getDepartments(),
	});
	const { data: occupations = [] } = useQuery({
		queryKey: shiftTemplateKeys.occupations(),
		queryFn: () => ShiftTemplatesService.getOccupations(),
	});

	const { data: membersRes } = useOrgMembersForPicker(orgId);
	const { data: complianceChecklist } = useComplianceChecklist(
		orgId,
		data?.jobDetails.complianceTemplateId ?? "",
	);
	const { data: requisitionTemplate } = useRequisitionTemplate(
		orgId,
		data?.templateId ?? null,
	);

	const cancelJob = useCancelRequisition(orgId);

	const allowedSubmissionStages = useMemo<SubmissionStageKey[]>(
		() =>
			SUBMISSION_STAGE_TABS.filter(({ stage }) =>
				ability.can(Action.List, subjectInstance("Submission", { stage })),
			).map(({ stage }) => stage),
		[ability],
	);

	const canReadJob = ability.can(Action.Read, "Requisition");
	const canUpdateJob = ability.can(Action.Update, "Requisition");
	const canListAnySubmission = allowedSubmissionStages.length > 0;

	const { occupationLabel, specialtyLabel } = useMemo(() => {
		if (!data) {
			return { occupationLabel: "—", specialtyLabel: "—" };
		}
		const { occupation, specialty } = resolveOccupationAndSpecialty(
			occupations,
			data.jobDetails.occupation,
			data.jobDetails.specialty,
		);
		return { occupationLabel: occupation, specialtyLabel: specialty };
	}, [data, occupations]);

	const totalApplications = useMemo(() => {
		if (!stageCounts) {
			return 0;
		}
		return Object.values(stageCounts).reduce((a, b) => a + b, 0);
	}, [stageCounts]);

	const positionsAccepted = stageCounts?.ACCEPTED ?? 0;
	const openSlots = data
		? Math.max(0, data.jobDetails.numberOfPositions - positionsAccepted)
		: 0;

	const requirementNames = useMemo(() => {
		if (!data) {
			return [] as string[];
		}
		const ids = new Set(data.submissionSettings.acceptanceCriteriaIds);
		if (!complianceChecklist?.items?.length) {
			return [] as string[];
		}
		return complianceChecklist.items
			.filter((i) => ids.has(i.complianceListItemId))
			.map((i) => i.complianceListItem.name);
	}, [data, complianceChecklist]);

	const hiringManagerName = useMemo(() => {
		if (!data) {
			return "—";
		}
		return (
			membersRes?.data?.find((m) => m.id === data.jobDetails.hiringManagerId)
				?.user.name ?? "—"
		);
	}, [data, membersRes]);

	const scheduleDisplay = useMemo(() => {
		if (!data) {
			return "—";
		}
		return formatScheduleFromTimes(
			data.jobDetails.startTime,
			data.jobDetails.endTime,
			data.jobDetails.shiftsPerWeek,
		);
	}, [data]);

	const submissionTypeLabel = useMemo(() => {
		if (!data) {
			return "—";
		}
		return getLabel(
			JOB_POSTING_SUBMISSION_TYPE_OPTIONS.map((o) => ({
				value: o.value,
				label: o.label,
			})),
			data.submissionSettings.submissionType,
		);
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

	const locName = resolveLocationName(locations, data.jobDetails.location);
	const deptName = resolveDepartmentName(
		departments,
		data.jobDetails.department,
	);
	const title = data.jobDetails.requisitionName || "Job posting";

	let startLabel = "—";
	try {
		if (data.jobDetails.startDate) {
			startLabel = format(parseISO(data.jobDetails.startDate), "MMM d, yyyy");
		}
	} catch {
		startLabel = "—";
	}

	return (
		<div className="space-y-8">
			<PageBackLink href="/org/jobs">Back to Jobs</PageBackLink>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0 space-y-2">
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
						{title}
					</h1>
					<div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
						<Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
							Open
						</Badge>
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
						<Button type="button" variant="outline" asChild>
							<Link href={`/org/jobs/${jobId}/edit`}>
								<Pencil className="size-4" />
								Edit
							</Link>
						</Button>
					) : null}
					{canUpdateJob ? (
						<Button
							type="button"
							variant="outline"
							className="border-destructive/40 text-destructive hover:bg-destructive/5"
							onClick={() => setCloseDialogOpen(true)}
						>
							<XCircle className="size-4" />
							Close job
						</Button>
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
					orgId={orgId}
					jobId={jobId}
					allowedStages={allowedSubmissionStages}
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
				requirements={requirementNames}
				benefits={data.jobDetails.benefitsPerks ?? []}
			/>

			<JobRequisitionDetailsCard
				location={locName}
				department={deptName}
				occupation={occupationLabel}
				specialty={specialtyLabel}
				billRate={formatBillRateDisplay(data.jobDetails.billRate)}
				vendorRate="—"
				startDate={formatIsoDateOnly(data.jobDetails.startDate)}
				endDate={formatIsoDateOnly(data.jobDetails.endDate)}
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
				templateName={
					requisitionTemplate?.templateName?.trim() || "Requisition template"
				}
				occupation={occupationLabel}
				department={deptName}
				location={locName}
				hiringManager={hiringManagerName}
				startDate={formatIsoDateOnly(data.jobDetails.startDate)}
				endDate={formatIsoDateOnly(data.jobDetails.endDate)}
				billRate={formatBillRateDisplay(data.jobDetails.billRate)}
				shiftType={formatShiftTypeHuman(String(data.jobDetails.shiftType))}
				hoursPerWeek={formatHoursPerWeek(data.jobDetails.hoursPerWeek)}
				schedule={scheduleDisplay}
				visibility={publishVisibilityLabel(data.publishSettings.publishMode)}
				submissionRule={submissionTypeLabel}
				postedOrPublishLabel={postedDateLabel(data.publishSettings)}
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
