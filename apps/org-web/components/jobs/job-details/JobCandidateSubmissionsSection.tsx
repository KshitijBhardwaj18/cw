"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import type { SubmissionStageKey } from "@/constants/submissions";
import { useJobCandidateSubmissionsSection } from "@/hooks/use-job-candidate-submissions-section";
import { getSubmissionStageLabel } from "@/utils/submission-stage-label";
import { JobCandidateSubmissionRejectDialog } from "./JobCandidateSubmissionRejectDialog";
import { JobCandidateSubmissionsListBody } from "./JobCandidateSubmissionsListBody";
import { JobCandidateSubmissionsPagination } from "./JobCandidateSubmissionsPagination";
import { JobCandidateSubmissionsStageTabs } from "./JobCandidateSubmissionsStageTabs";
import { JobSubmissionHistorySheet } from "./JobSubmissionHistorySheet";

const cardSectionTitleClassName =
	"text-muted-foreground text-xs font-semibold tracking-wide uppercase";

export interface JobCandidateSubmissionsSectionProps {
	orgId: string;
	jobId: string;
	allowedStages: readonly SubmissionStageKey[];
}

export function JobCandidateSubmissionsSection({
	orgId,
	jobId,
	allowedStages,
}: JobCandidateSubmissionsSectionProps) {
	const {
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
	} = useJobCandidateSubmissionsSection({ orgId, jobId, allowedStages });

	if (visibleTabs.length === 0 || !activeStage) {
		return null;
	}

	return (
		<>
			<Card>
				<CardHeader className="space-y-1 pb-0">
					<CardTitle className={cardSectionTitleClassName}>
						Candidate submissions
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<JobCandidateSubmissionsStageTabs
						activeStage={activeStage}
						visibleTabs={visibleTabs}
						stageCounts={stageCounts}
						onStageChange={handleStageChange}
					/>

					<div className="border-border divide-y">
						<JobCandidateSubmissionsListBody
							isLoading={isLoading}
							rows={rows}
							isMutationPending={updateStage.isPending}
							onAdvance={handleAdvance}
							onOpenHistory={setHistoryRow}
							onRequestReject={setRejectRow}
						/>
					</div>

					<JobCandidateSubmissionsPagination
						page={page}
						totalPages={totalPages}
						onPageChange={setPage}
					/>
				</CardContent>
			</Card>

			{historyRow ? (
				<JobSubmissionHistorySheet
					open
					onOpenChange={(open) => {
						if (!open) {
							setHistoryRow(null);
						}
					}}
					orgId={orgId}
					submissionId={historyRow.id}
					candidateName={historyRow.candidateName}
					occupationLabel={historyRow.occupationLabel}
					departmentName={historyRow.departmentName}
					stageLabel={getSubmissionStageLabel(historyRow.stage)}
				/>
			) : null}

			<JobCandidateSubmissionRejectDialog
				open={rejectRow != null}
				candidateName={rejectRow?.candidateName ?? "this candidate"}
				onOpenChange={(o) => {
					if (!o) {
						setRejectRow(null);
					}
				}}
				onConfirmReject={confirmReject}
			/>
		</>
	);
}
