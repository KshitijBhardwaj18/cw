"use client";

import type { SubmissionListRow } from "@/constants/submissions";
import { JobCandidateSubmissionRow } from "./JobCandidateSubmissionRow";

export interface JobCandidateSubmissionsListBodyProps {
	isLoading: boolean;
	rows: SubmissionListRow[];
	isMutationPending: boolean;
	onAdvance: (row: SubmissionListRow) => void;
	onOpenHistory: (row: SubmissionListRow) => void;
	onRequestReject: (row: SubmissionListRow) => void;
}

export function JobCandidateSubmissionsListBody({
	isLoading,
	rows,
	isMutationPending,
	onAdvance,
	onOpenHistory,
	onRequestReject,
}: JobCandidateSubmissionsListBodyProps) {
	if (isLoading) {
		return (
			<div className="text-muted-foreground p-8 text-center text-sm">
				Loading submissions…
			</div>
		);
	}
	if (rows.length === 0) {
		return (
			<div className="text-muted-foreground p-8 text-center text-sm">
				No candidates in this stage for this job.
			</div>
		);
	}
	return (
		<>
			{rows.map((row) => (
				<JobCandidateSubmissionRow
					key={row.id}
					row={row}
					isMutationPending={isMutationPending}
					onAdvance={onAdvance}
					onOpenHistory={onOpenHistory}
					onRequestReject={onRequestReject}
				/>
			))}
		</>
	);
}
