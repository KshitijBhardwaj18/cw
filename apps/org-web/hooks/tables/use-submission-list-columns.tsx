"use client";

import { formatUsdPerHour } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import { SubmissionSlaStatusCell } from "@/components/submissions/SubmissionSlaStatusCell";
import { SubmissionTimeInStageCell } from "@/components/submissions/SubmissionTimeInStageCell";
import type { SubmissionListRow } from "@/constants/submissions";

const COL = "max-w-[200px] min-w-0 px-2";

export function useSubmissionListColumns() {
	return useMemo<ColumnDef<SubmissionListRow>[]>(
		() => [
			{
				id: "sla",
				header: "Status",
				accessorKey: "slaLabel",
				cell: ({ row }) => (
					<div className={COL}>
						<SubmissionSlaStatusCell row={row.original} />
					</div>
				),
			},
			{
				id: "candidate",
				header: "Candidate",
				accessorFn: (r) => r.candidateName,
				cell: ({ row }) => (
					<div className={COL}>
						<p className="truncate font-semibold text-sm">
							{row.original.candidateName}
						</p>
						<p className="text-muted-foreground text-xs truncate">
							{row.original.candidateEmail}
						</p>
					</div>
				),
			},
			{
				id: "jobTitle",
				header: "Job Title",
				accessorFn: (r) => r.jobTitle,
				cell: ({ row }) => (
					<div className={COL}>
						<p className="truncate font-semibold text-sm">
							{row.original.jobTitle}
						</p>
						<p className="text-muted-foreground text-xs truncate">
							{row.original.facilityName}
						</p>
					</div>
				),
			},
			{
				id: "occupation",
				header: "Occupation",
				accessorFn: (r) => r.occupationLabel,
				cell: ({ row }) => (
					<div className={COL}>
						<p className="truncate font-semibold text-sm">
							{row.original.occupationLabel}
						</p>
						<p className="text-muted-foreground text-xs truncate">
							{row.original.departmentName}
						</p>
					</div>
				),
			},
			{
				id: "vendor",
				header: "Vendor",
				accessorFn: (r) => r.vendorName,
				cell: ({ row }) => (
					<div className={COL}>
						<button
							type="button"
							className="inline-flex w-full min-w-0 items-center gap-1.5 text-left text-primary text-sm font-medium underline-offset-4 hover:underline"
							onClick={(e) => {
								e.stopPropagation();
								toast.message(`Vendor: ${row.original.vendorName}`, {
									description: "Vendor profile will open when wired to data.",
								});
							}}
						>
							<Building2 className="size-3.5 shrink-0" />
							<span className="min-w-0 truncate">
								{row.original.vendorName}
							</span>
						</button>
					</div>
				),
			},
			{
				id: "hiringManager",
				header: "Hiring Manager",
				accessorFn: (r) => r.hiringManagerName,
				cell: ({ row }) => (
					<div className={COL}>
						<p className="truncate font-semibold text-sm">
							{row.original.hiringManagerName}
						</p>
						<p className="text-muted-foreground text-xs truncate">
							{row.original.hiringManagerDepartment}
						</p>
					</div>
				),
			},
			{
				id: "billRate",
				header: "Bill Rate",
				accessorFn: (r) => r.billRate ?? 0,
				cell: ({ row }) => {
					const rate = row.original.billRate;
					return (
						<div className={COL}>
							<span className="block truncate text-sm tabular-nums">
								{rate != null
									? formatUsdPerHour(rate, { round: true, fractionDigits: 0 })
									: "—"}
							</span>
						</div>
					);
				},
			},
			{
				id: "timeInStage",
				header: "Time In Stage",
				cell: ({ row }) => (
					<div className={COL}>
						<SubmissionTimeInStageCell
							stageEnteredAt={row.original.stageEnteredAt}
							agingDeadlineAt={row.original.agingDeadlineAt}
						/>
					</div>
				),
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => (
					<div className={COL}>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="w-full max-w-full text-primary"
							asChild
						>
							<Link
								href={`/org/submissions/${row.original.id}`}
								onClick={(e) => e.stopPropagation()}
							>
								View details
							</Link>
						</Button>
					</div>
				),
			},
		],
		[],
	);
}
