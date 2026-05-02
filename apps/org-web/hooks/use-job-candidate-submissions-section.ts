"use client";

import { Action, subjectInstance, useAbility } from "@repo/casl";
import { getLabel } from "@repo/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { JOB_SUBMISSION_PRIMARY_ADVANCE } from "@/constants/job-submission-primary-action";
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
	orgId: string;
	jobId: string;
	allowedStages: readonly SubmissionStageKey[];
}

const EMPTY_STAGE_COUNTS: Record<SubmissionStageKey, number> =
	Object.fromEntries(
		SUBMISSION_STAGE_TABS.map(({ stage }) => [stage, 0]),
	) as Record<SubmissionStageKey, number>;

export function useJobCandidateSubmissionsSection({
	orgId,
	jobId,
	allowedStages,
}: UseJobCandidateSubmissionsSectionArgs) {
	const ability = useAbility();

	const { data: stageCountsData } = useJobSubmissionStageCounts(orgId, jobId, {
		enabled: !!orgId && !!jobId,
	});
	const stageCounts = stageCountsData ?? EMPTY_STAGE_COUNTS;

	const [activeStage, setActiveStage] = useState<SubmissionStageKey | null>(
		null,
	);
	const [page, setPage] = useState(1);
	const [historyRow, setHistoryRow] = useState<SubmissionListRow | null>(null);
	const [rejectRow, setRejectRow] = useState<SubmissionListRow | null>(null);

	const visibleTabs = useMemo(
		() => SUBMISSION_STAGE_TABS.filter((t) => allowedStages.includes(t.stage)),
		[allowedStages],
	);

	useEffect(() => {
		if (visibleTabs.length === 0) {
			setActiveStage(null);
			return;
		}
		setActiveStage((prev) => {
			if (prev && visibleTabs.some((t) => t.stage === prev)) {
				return prev;
			}
			return visibleTabs[0].stage;
		});
	}, [visibleTabs]);

	const { data: listData, isLoading: listLoading } = useOrgSubmissionsList(
		orgId,
		{
			requisitionId: jobId,
			stage: activeStage ?? "SUBMITTED",
			page,
			limit: PAGE_SIZE,
		},
		{
			enabled: !!orgId && !!jobId && !!activeStage,
		},
	);

	const updateStage = useUpdateOrgSubmissionStage(orgId);

	const rows = listData?.data ?? [];
	const totalPages = listData?.totalPages ?? 0;
	const isLoading = listLoading;

	const handleStageChange = useCallback((stage: SubmissionStageKey) => {
		setActiveStage(stage);
		setPage(1);
	}, []);

	const handleAdvance = useCallback(
		(row: SubmissionListRow) => {
			const next = JOB_SUBMISSION_PRIMARY_ADVANCE[row.stage];
			if (!next) return;
			if (
				!ability.can(
					Action.Update,
					subjectInstance("Submission", { stage: row.stage }),
				)
			) {
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
		[ability, updateStage],
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
		visibleTabs,
		rows,
		totalPages,
		isLoading,
		updateStage,
		handleStageChange,
		handleAdvance,
		confirmReject,
	};
}
