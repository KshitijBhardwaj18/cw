"use client";

import { Action, subjectInstance, useAbility } from "@repo/casl";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Briefcase,
	Check,
	Clock,
	Eye,
	History,
	Tag,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { JOB_SUBMISSION_PRIMARY_ADVANCE } from "@/constants/job-submission-primary-action";
import type { SubmissionListRow } from "@/constants/submissions";
import {
	candidateInitialsFromName,
	formatJobSubmissionStageAt,
} from "@/utils/job-candidate-submission-format";
import { getSubmissionStageLabel } from "@/utils/submission-stage-label";

export interface JobCandidateSubmissionRowProps {
	row: SubmissionListRow;
	isMutationPending: boolean;
	onAdvance: (row: SubmissionListRow) => void;
	onOpenHistory: (row: SubmissionListRow) => void;
	onRequestReject: (row: SubmissionListRow) => void;
}

export function JobCandidateSubmissionRow({
	row,
	isMutationPending,
	onAdvance,
	onOpenHistory,
	onRequestReject,
}: JobCandidateSubmissionRowProps) {
	const ability = useAbility();
	const advance = JOB_SUBMISSION_PRIMARY_ADVANCE[row.stage];
	const canAct = ability.can(
		Action.Update,
		subjectInstance("Submission", { stage: row.stage }),
	);

	return (
		<div className="flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 flex-1 gap-3">
				<Avatar className="size-10">
					<AvatarFallback>
						{candidateInitialsFromName(row.candidateName)}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0">
					<p className="truncate font-semibold">{row.candidateName}</p>
					<div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
						<span className="inline-flex items-center gap-1">
							<Briefcase className="size-3.5" />
							{row.occupationLabel}
						</span>
						<span className="inline-flex items-center gap-1">
							<Tag className="size-3.5" />
							{row.departmentName}
						</span>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-1 sm:items-end sm:text-center">
				<Badge variant="info">{getSubmissionStageLabel(row.stage)}</Badge>
				<div className="text-muted-foreground flex items-center gap-1 text-xs">
					<Clock className="size-3.5 shrink-0" />
					{formatJobSubmissionStageAt(row.stageEnteredAt)}
				</div>
			</div>

			<div className="flex flex-wrap items-center justify-end gap-2">
				<Button type="button" size="sm" variant="default" asChild>
					<Link href={`/org/submissions/${row.id}`}>
						<Eye className="size-3.5" />
						View
					</Link>
				</Button>
				{advance && canAct ? (
					<Button
						type="button"
						size="sm"
						variant="default"
						className="bg-blue-500 text-white hover:bg-blue-500/90"
						disabled={isMutationPending}
						onClick={() => onAdvance(row)}
					>
						<Check className="size-3.5" />
						{advance.label}
					</Button>
				) : null}
				<Button
					type="button"
					size="icon"
					variant="outline"
					className="shrink-0"
					aria-label="Submission history"
					onClick={() => onOpenHistory(row)}
				>
					<History className="size-4" />
				</Button>
				{row.stage !== "REJECTED" && row.stage !== "WITHDRAWN" && canAct ? (
					<Button
						type="button"
						size="icon"
						variant="outline"
						className="text-destructive border-destructive/40 hover:bg-destructive/10 shrink-0"
						aria-label="Reject submission"
						disabled={isMutationPending}
						onClick={() => onRequestReject(row)}
					>
						<XCircle className="size-4" />
					</Button>
				) : null}
			</div>
		</div>
	);
}
