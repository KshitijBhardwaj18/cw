"use client";

import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";
import type { CandidateProcessingIssueTableItem } from "@/types/command-center";

export const useCandidateProcessingIssueColumns = () => {
	const columns = useMemo<ColumnDef<CandidateProcessingIssueTableItem>[]>(
		() => [
			{
				accessorKey: "candidate",
				header: "Candidate",
			},
			{
				accessorKey: "jobTitle",
				header: "Job Title",
			},
			{
				accessorKey: "occupation",
				header: "Occupation",
				cell: ({ row }) => (
					<span className="text-muted-foreground">
						{row.original.occupation}
					</span>
				),
			},
			{
				accessorKey: "submittedBy",
				header: "Submitted By",
				cell: ({ row }) => (
					<span className="text-muted-foreground">
						{row.original.submittedBy}
					</span>
				),
			},
			{
				accessorKey: "billRate",
				header: "Bill Rate",
				cell: ({ row }) => (
					<span className="text-primary font-medium">
						{row.original.billRate}
					</span>
				),
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => (
					<Button size="sm" asChild>
						<Link href={`/org/submissions/${row.original.id}`}>
							View Details
						</Link>
					</Button>
				),
			},
		],
		[],
	);

	return { columns };
};
