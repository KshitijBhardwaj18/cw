"use client";

import { CANDIDATE_WORKFORCE_TYPE_OPTIONS, getLabel } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { TagsCell } from "@repo/ui/general/TagsCell";
import { cn } from "@repo/ui/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { WorkforceListMemberItem } from "@/types/workforce-list";

export function useAddMembersToListColumns(): ColumnDef<WorkforceListMemberItem>[] {
	return useMemo<ColumnDef<WorkforceListMemberItem>[]>(
		() => [
			{
				id: "fullName",
				header: "Full Name",
				cell: ({ row }) => (
					<div className="flex flex-col">
						<span className="font-medium text-sm text-foreground">
							{row.original.name}
						</span>
						<span className="text-sm text-muted-foreground">
							{row.original.email}
						</span>
					</div>
				),
			},
			{
				id: "workforceType",
				header: "Workforce Type",
				cell: ({ row }) => {
					const wt = row.original.workforceType;
					if (!wt)
						return <span className="text-muted-foreground text-sm">—</span>;
					const label = getLabel(CANDIDATE_WORKFORCE_TYPE_OPTIONS, wt);
					return (
						<Badge
							variant="outline"
							className={cn(
								"text-sm font-medium border",
								wt.startsWith("INTERNAL_")
									? "bg-purple-100 text-purple-800"
									: "bg-blue-100 text-blue-800",
							)}
						>
							{label}
						</Badge>
					);
				},
			},
			{
				id: "occupation",
				header: "Occupation",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground">
						{row.original.occupation}
					</span>
				),
			},
			{
				id: "specialty",
				header: "Specialty",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground">
						{row.original.specialty}
					</span>
				),
			},
			{
				id: "tags",
				header: "Tags",
				cell: ({ row }) => <TagsCell tags={row.original.tags} />,
			},
			{
				id: "status",
				header: "Status",
				cell: ({ row }) => (
					<Badge
						variant="secondary"
						className="text-sm font-medium px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-100"
					>
						{row.original.status}
					</Badge>
				),
			},
		],
		[],
	);
}
