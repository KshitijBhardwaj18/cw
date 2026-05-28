"use client";

import {
	CANDIDATE_SOURCE_OPTIONS,
	CandidateSource,
	getLabel,
	SubmissionStage,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { getAddExistingTalentStatusLabel } from "@/constants/add-existing-talent-community";
import type { AddExistingTalentCandidateRow } from "@/types/talent-community-add-existing";

const WORKFORCE_GROUP_BADGE_CLASS =
	"border-muted-foreground/20 bg-muted/40 text-foreground";

function sourceBadgeClass(
	source: AddExistingTalentCandidateRow["source"],
): string {
	switch (source) {
		case CandidateSource.DIRECT:
			return "border-transparent bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200";
		case CandidateSource.VENDOR:
			return "border-transparent bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200";
		case CandidateSource.PREVIOUS_WORKER:
			return "border-transparent bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200";
	}
}

function statusBadgeClass(
	status: AddExistingTalentCandidateRow["status"],
): string {
	if (status === "INACTIVE") {
		return "border-slate-200 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
	}
	switch (status) {
		case SubmissionStage.QUALIFIED:
		case SubmissionStage.SHORTLISTED:
			return "border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100";
		case SubmissionStage.SUBMITTED:
			return "border-sky-200 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100";
		case SubmissionStage.INTERVIEW_SCHEDULED:
		case SubmissionStage.INTERVIEW_COMPLETED:
			return "border-indigo-200 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-100";
		case SubmissionStage.OFFERED:
		case SubmissionStage.ACCEPTED:
			return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100";
		case SubmissionStage.WITHDRAWN:
		case SubmissionStage.REJECTED:
			return "border-rose-200 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100";
		default:
			return "border-muted bg-muted/50 text-foreground";
	}
}

export function useAddExistingTalentColumns(): ColumnDef<AddExistingTalentCandidateRow>[] {
	return useMemo<ColumnDef<AddExistingTalentCandidateRow>[]>(
		() => [
			{
				id: "fullName",
				header: "Full Name",
				cell: ({ row }) => (
					<div className="flex flex-col">
						<span className="font-medium text-foreground text-sm">
							{row.original.name}
						</span>
						<span className="text-muted-foreground text-sm">
							{row.original.email}
						</span>
					</div>
				),
			},
			{
				id: "workforceGroup",
				header: "Workforce Group",
				cell: ({ row }) => {
					const g = row.original.workforceGroup;
					return (
						<Badge
							variant="outline"
							className={cn("font-medium text-xs", WORKFORCE_GROUP_BADGE_CLASS)}
						>
							{g}
						</Badge>
					);
				},
			},
			{
				id: "occupation",
				header: "Occupation",
				cell: ({ row }) => (
					<span className="text-muted-foreground text-sm">
						{row.original.occupation}
					</span>
				),
			},
			{
				id: "specialty",
				header: "Specialty",
				cell: ({ row }) => (
					<span className="text-muted-foreground text-sm">
						{row.original.specialty}
					</span>
				),
			},
			{
				id: "source",
				header: "Source",
				cell: ({ row }) => (
					<Badge
						variant="secondary"
						className={cn(
							"font-medium text-xs",
							sourceBadgeClass(row.original.source),
						)}
					>
						{getLabel(CANDIDATE_SOURCE_OPTIONS, row.original.source)}
					</Badge>
				),
			},
			{
				id: "status",
				header: "Status",
				cell: ({ row }) => (
					<Badge
						variant="secondary"
						className={cn(
							"font-medium text-xs",
							statusBadgeClass(row.original.status),
						)}
					>
						{getAddExistingTalentStatusLabel(row.original.status)}
					</Badge>
				),
			},
		],
		[],
	);
}
