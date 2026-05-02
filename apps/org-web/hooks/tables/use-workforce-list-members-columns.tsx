"use client";

import { CANDIDATE_WORKFORCE_TYPE_OPTIONS, getLabel } from "@repo/shared";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { TagsCell } from "@repo/ui/general/TagsCell";
import { cn } from "@repo/ui/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useMemo } from "react";
import type { WorkforceListMemberItem } from "@/types/workforce-list";

interface UseWorkforceListMembersColumnsProps {
	onRemove: (memberId: string, name: string) => void;
}

export function useWorkforceListMembersColumns({
	onRemove,
}: UseWorkforceListMembersColumnsProps) {
	return useMemo<ColumnDef<WorkforceListMemberItem>[]>(
		() => [
			{
				id: "name",
				header: "Name",
				cell: ({ row }) => {
					const member = row.original;
					return (
						<div className="flex items-center gap-3">
							<Avatar className="size-9">
								<AvatarFallback className="bg-primary/90 text-primary-foreground text-sm font-semibold">
									{member.initials}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-semibold text-sm">{member.name}</p>
								<p className="text-muted-foreground text-sm">{member.email}</p>
							</div>
						</div>
					);
				},
			},
			{
				id: "occupation",
				header: "Occupation",
				cell: ({ row }) => (
					<span className="text-sm">{row.original.occupation}</span>
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
				id: "tags",
				header: "Tags",
				cell: ({ row }) => <TagsCell tags={row.original.tags} />,
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="text-destructive hover:text-destructive size-8"
						onClick={() => onRemove(row.original.id, row.original.name)}
						aria-label={`Remove ${row.original.name}`}
					>
						<X className="size-4" />
					</Button>
				),
			},
		],
		[onRemove],
	);
}
