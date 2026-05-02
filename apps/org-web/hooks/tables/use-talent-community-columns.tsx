"use client";

import {
	CANDIDATE_WORKFORCE_TYPE_OPTIONS,
	type CandidateTalentType,
	getLabel,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useMemo } from "react";
import { InviteStatusBadge } from "@/components/talent-community/InviteStatusBadge";
import type { TalentCommunityTab } from "@/services/talent-community.service";

export function useTalentCommunityColumns(
	activeTab: TalentCommunityTab,
	onViewProfile?: (candidate: CandidateTalentType) => void,
) {
	return useMemo<ColumnDef<CandidateTalentType>[]>(() => {
		const baseColumns: ColumnDef<CandidateTalentType>[] = [
			{
				id: "name",
				header: "Name",
				cell: ({ row }) => {
					const candidate = row.original;
					const specialty =
						candidate.candidateSpecialties[0]?.specialty?.name ?? null;
					return (
						<div>
							<p className="font-semibold text-sm">{candidate.user.name}</p>
							{specialty && (
								<p className="text-muted-foreground text-xs">{specialty}</p>
							)}
						</div>
					);
				},
			},
			{
				id: "occupation",
				header: "Occupation",
				cell: ({ row }) => row.original.occupation?.name ?? "—",
			},
		];

		if (activeTab !== "invited") {
			baseColumns.push({
				id: "workforceType",
				header: "Workforce Type",
				cell: ({ row }) => {
					const wt = row.original.workforceType;
					if (!wt)
						return <span className="text-muted-foreground text-sm">—</span>;
					return (
						<Badge variant="outline" className="text-xs">
							{getLabel(CANDIDATE_WORKFORCE_TYPE_OPTIONS, wt)}
						</Badge>
					);
				},
			});
		}

		if (activeTab === "invited") {
			baseColumns.push({
				id: "inviteStatus",
				header: "Invite Status",
				cell: ({ row }) => (
					<InviteStatusBadge inviteStatus={row.original.inviteStatus} />
				),
			});
		}

		baseColumns.push(
			{
				id: "placementStatus",
				header: "Placement Status",
				cell: () => (
					<Badge
						variant="outline"
						className="text-muted-foreground border-muted-foreground/30 text-xs"
					>
						Not Assigned
					</Badge>
				),
			},
			{
				id: "vendor",
				header: "Vendor",
				cell: ({ row }) =>
					row.original.vendor?.name ?? (
						<span className="text-muted-foreground">—</span>
					),
			},
			{
				id: "contact",
				header: "Contact",
				cell: ({ row }) => {
					const { email, phoneNumber } = row.original.user;
					return (
						<div className="space-y-0.5">
							<p className="text-sm">{email}</p>
							{phoneNumber && (
								<p className="text-muted-foreground text-xs">{phoneNumber}</p>
							)}
						</div>
					);
				},
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="size-8">
								<MoreHorizontal className="size-4" />
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={() => onViewProfile?.(row.original)}>
								View Profile
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				),
			},
		);

		return baseColumns;
	}, [activeTab, onViewProfile]);
}
