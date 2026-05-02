"use client";

import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import {
	CANDIDATE_SOURCE_LABELS,
	getAddExistingTalentStatusLabel,
} from "@/constants/add-existing-talent-community";
import type { AddExistingTalentCandidateRow } from "@/types/talent-community-add-existing";

const WORKFORCE_GROUP_BADGE: Record<string, string> = {
	"Nursing Staff":
		"border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
	"Rehabilitation Team":
		"border-cyan-200 bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200",
	"Medical Support":
		"border-pink-200 bg-pink-50 text-pink-800 dark:bg-pink-950/40 dark:text-pink-200",
};

function sourceBadgeClass(
	source: AddExistingTalentCandidateRow["source"],
): string {
	switch (source) {
		case "DIRECT":
			return "border-transparent bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-200";
		case "VENDOR":
			return "border-transparent bg-violet-50 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200";
		case "PREVIOUS_WORKER":
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
		case "QUALIFIED":
		case "SHORTLISTED":
			return "border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100";
		case "SUBMITTED":
			return "border-sky-200 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100";
		case "INTERVIEW_SCHEDULED":
		case "INTERVIEW_COMPLETED":
			return "border-indigo-200 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-100";
		case "OFFERED":
		case "ACCEPTED":
			return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100";
		case "WITHDRAWN":
		case "REJECTED":
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
							className={cn(
								"font-medium text-xs",
								WORKFORCE_GROUP_BADGE[g] ??
									"border-muted-foreground/20 bg-muted/40 text-foreground",
							)}
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
						{CANDIDATE_SOURCE_LABELS[row.original.source]}
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
