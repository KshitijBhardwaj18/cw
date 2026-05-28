"use client";

import { Action, subjectInstance, useAbility } from "@repo/casl";
import { getLabel } from "@repo/shared";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { ScheduleInterviewValues } from "@/components/submissions/ScheduleInterviewDialog";
import { getSubmissionPrimaryAdvance } from "@/constants/job-submission-primary-action";
import {
	SUBMISSION_STAGE_SELECT_OPTIONS,
	SUBMISSION_STAGE_TABS,
	type SubmissionListRow,
	type SubmissionStageKey,
} from "@/constants/submissions";
import {
	useJobSubmissionStageCounts,
	useOrgSubmissionsList,
	useUpdateOrgSubmissionStage,
} from "@/queries/submissions.queries";

const PAGE_SIZE = 10;

export interface UseJobCandidateSubmissionsSectionArgs {
	jobId: string;
	allowedStages: readonly SubmissionStageKey[];
	isInterviewRequired: boolean;
}

const SUBMISSION_PARAMS = {
	PAGE: "subPage",
} as const;

const EMPTY_STAGE_COUNTS: Record<SubmissionStageKey, number> =
	Object.fromEntries(
		SUBMISSION_STAGE_TABS.map(({ stage }) => [stage, 0]),
	) as Record<SubmissionStageKey, number>;

export function useJobCandidateSubmissionsSection({
	jobId,
	allowedStages,
	isInterviewRequired,
}: UseJobCandidateSubmissionsSectionArgs) {
	const ability = useAbility();

	const { data: stageCountsData } = useJobSubmissionStageCounts(jobId, {
		enabled: !!jobId,
	});
	const stageCounts = stageCountsData ?? EMPTY_STAGE_COUNTS;

	const visibleTabs = useMemo(
		() => SUBMISSION_STAGE_TABS.filter((t) => allowedStages.includes(t.stage)),
		[allowedStages],
	);

	const [activeStage, setActiveStage] = useTabSwitch<SubmissionStageKey>(
		visibleTabs.map(({ stage }) => stage),
		{ alsoClearParamKeys: [SUBMISSION_PARAMS.PAGE] },
	);
	const { page, setPage } = usePaginationControls({
		pageParamKey: SUBMISSION_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const [historyRow, setHistoryRow] = useState<SubmissionListRow | null>(null);
	const [rejectRow, setRejectRow] = useState<SubmissionListRow | null>(null);
	const [offerRow, setOfferRow] = useState<SubmissionListRow | null>(null);
	const [scheduleInterviewRow, setScheduleInterviewRow] =
		useState<SubmissionListRow | null>(null);

	const { data: listData, isLoading: listLoading } = useOrgSubmissionsList(
		{
			requisitionId: jobId,
			stage: activeStage ?? "SUBMITTED",
			page,
			limit: PAGE_SIZE,
		},
		{
			enabled: !!jobId && !!activeStage,
		},
	);

	const updateStage = useUpdateOrgSubmissionStage();

	const rows = listData?.data ?? [];
	const totalPages = listData?.totalPages ?? 0;
	const isLoading = listLoading;

	const handleAdvance = useCallback(
		(row: SubmissionListRow) => {
			const next = getSubmissionPrimaryAdvance(row.stage, isInterviewRequired);

			if (!next) return;
			if (
				!ability.can(
					Action.Update,
					subjectInstance("Submission", { stage: row.stage }),
				)
			) {
				return;
			}
			if (next.next === "OFFERED") {
				setOfferRow(row);
				return;
			}
			if (next.next === "INTERVIEW_SCHEDULED") {
				setScheduleInterviewRow(row);
				return;
			}
			updateStage.mutate(
				{ submissionId: row.id, stage: next.next },
				{
					onSuccess: () => {
						toast.success(
							`Moved to ${getLabel(SUBMISSION_STAGE_SELECT_OPTIONS, next.next)}.`,
						);
					},
					onError: (e) => {
						toast.error(
							e instanceof Error ? e.message : "Could not update submission.",
						);
					},
				},
			);
		},
		[ability, updateStage, isInterviewRequired],
	);

	const confirmScheduleInterview = useCallback(
		(values: ScheduleInterviewValues) => {
			if (!scheduleInterviewRow) return;
			if (
				!ability.can(
					Action.Update,
					subjectInstance("Submission", { stage: scheduleInterviewRow.stage }),
				)
			) {
				return;
			}
			updateStage.mutate(
				{
					submissionId: scheduleInterviewRow.id,
					stage: "INTERVIEW_SCHEDULED",
					interviewDate: values.interviewDate,
					interviewLocation: values.interviewLocation,
					interviewNotes: values.interviewNotes,
				},
				{
					onSuccess: () => {
						toast.success("Interview scheduled.");
						setScheduleInterviewRow(null);
					},
					onError: (e) => {
						toast.error(
							e instanceof Error ? e.message : "Could not schedule interview.",
						);
					},
				},
			);
		},
		[ability, scheduleInterviewRow, updateStage],
	);

	const confirmOffer = useCallback(
		(params: {
			startDate: string;
			endDate: string;
			billRate: number | null;
		}) => {
			if (!offerRow) return;
			if (
				!ability.can(
					Action.Update,
					subjectInstance("Submission", { stage: offerRow.stage }),
				)
			) {
				return;
			}
			updateStage.mutate(
				{
					submissionId: offerRow.id,
					stage: "OFFERED",
					startDate: params.startDate,
					endDate: params.endDate,
					billRate: params.billRate ?? undefined,
				},
				{
					onSuccess: () => {
						toast.success("Offer extended.");
						setOfferRow(null);
					},
					onError: (e) => {
						toast.error(
							e instanceof Error ? e.message : "Could not extend offer.",
						);
					},
				},
			);
		},
		[ability, offerRow, updateStage],
	);

	const confirmReject = useCallback(() => {
		if (!rejectRow) return;
		if (
			!ability.can(
				Action.Update,
				subjectInstance("Submission", { stage: rejectRow.stage }),
			)
		) {
			return;
		}
		updateStage.mutate(
			{ submissionId: rejectRow.id, stage: "REJECTED" },
			{
				onSuccess: () => {
					toast.success("Submission rejected.");
					setRejectRow(null);
				},
				onError: (e) => {
					toast.error(
						e instanceof Error ? e.message : "Could not reject submission.",
					);
				},
			},
		);
	}, [ability, rejectRow, updateStage]);

	return {
		PAGE_SIZE,
		stageCounts,
		activeStage,
		page,
		setPage,
		historyRow,
		setHistoryRow,
		rejectRow,
		setRejectRow,
		offerRow,
		setOfferRow,
		scheduleInterviewRow,
		setScheduleInterviewRow,
		visibleTabs,
		rows,
		totalPages,
		isLoading,
		updateStage,
		handleStageChange: setActiveStage,
		handleAdvance,
		confirmReject,
		confirmOffer,
		confirmScheduleInterview,
	};
}
