"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { ScheduleInterviewDialog } from "@/components/submissions/ScheduleInterviewDialog";
import type { SubmissionStageKey } from "@/constants/submissions";
import { useJobCandidateSubmissionsSection } from "@/hooks/use-job-candidate-submissions-section";
import { getSubmissionStageLabel } from "@/utils/submission-stage-label";
import { JobCandidateSubmissionRejectDialog } from "./JobCandidateSubmissionRejectDialog";
import { JobCandidateSubmissionsListBody } from "./JobCandidateSubmissionsListBody";
import { JobCandidateSubmissionsPagination } from "./JobCandidateSubmissionsPagination";
import { JobCandidateSubmissionsStageTabs } from "./JobCandidateSubmissionsStageTabs";
import {
	type JobOfferAdjustmentDefaults,
	JobOfferAdjustmentDialog,
} from "./JobOfferAdjustmentDialog";
import { JobSubmissionHistorySheet } from "./JobSubmissionHistorySheet";

export interface JobCandidateSubmissionsSectionProps {
	jobId: string;
	allowedStages: readonly SubmissionStageKey[];
	isInterviewRequired: boolean;
	offerDefaults?: JobOfferAdjustmentDefaults | null;
}

export function JobCandidateSubmissionsSection({
	jobId,
	allowedStages,
	isInterviewRequired,
	offerDefaults,
}: Readonly<JobCandidateSubmissionsSectionProps>) {
	const {
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
		handleStageChange,
		handleAdvance,
		confirmReject,
		confirmOffer,
		confirmScheduleInterview,
	} = useJobCandidateSubmissionsSection({
		jobId,
		allowedStages,
		isInterviewRequired,
	});

	if (visibleTabs.length === 0 || !activeStage) {
		return null;
	}

	return (
		<>
			<Card>
				<CardHeader className="space-y-1 border-b">
					<CardTitle className="text-xl">Candidate submissions</CardTitle>
				</CardHeader>
				<CardContent>
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
							isInterviewRequired={isInterviewRequired}
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

			<JobOfferAdjustmentDialog
				open={offerRow != null}
				row={offerRow}
				offerDefaults={offerDefaults}
				isPending={updateStage.isPending}
				onOpenChange={(o) => {
					if (!o) {
						setOfferRow(null);
					}
				}}
				onConfirm={confirmOffer}
			/>

			<ScheduleInterviewDialog
				open={scheduleInterviewRow != null}
				candidateName={scheduleInterviewRow?.candidateName}
				jobTitle={scheduleInterviewRow?.jobTitle}
				isPending={updateStage.isPending}
				onOpenChange={(o) => {
					if (!o) {
						setScheduleInterviewRow(null);
					}
				}}
				onSubmit={confirmScheduleInterview}
			/>
		</>
	);
}
