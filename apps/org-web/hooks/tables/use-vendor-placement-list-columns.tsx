"use client";

import { getInitials } from "@repo/shared";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, Eye, MapPin } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import type { PlacementListMockRow } from "@/types/placements";

function formatUsdPerHour(value: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

function headerClass() {
	return "text-muted-foreground text-xs font-semibold uppercase tracking-wide";
}

export function useVendorPlacementListColumns(detailBasePath: string) {
	return useMemo<ColumnDef<PlacementListMockRow>[]>(
		() => [
			{
				id: "candidate",
				header: () => <span className={headerClass()}>Candidate</span>,
				accessorFn: (r) => r.candidateName,
				cell: ({ row }) => (
					<div className="flex min-w-0 items-center gap-3">
						<Avatar className="size-9 shrink-0">
							<AvatarFallback className="text-xs">
								{getInitials(row.original.candidateName)}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="truncate font-medium text-sm">
								{row.original.candidateName}
							</p>
							<p className="text-muted-foreground truncate text-xs">
								{row.original.displayId}
							</p>
						</div>
					</div>
				),
			},
			{
				id: "jobTitle",
				header: () => <span className={headerClass()}>Job title</span>,
				accessorFn: (r) => r.jobTitle,
				cell: ({ row }) => (
					<span className="font-medium text-sm w-32 truncate">
						{row.original.jobTitle}
					</span>
				),
			},
			{
				id: "location",
				header: () => <span className={headerClass()}>Location</span>,
				accessorFn: (r) => r.location,
				cell: ({ row }) => (
					<div className="text-muted-foreground flex items-center gap-2 text-sm w-32">
						<MapPin className="size-4 shrink-0" aria-hidden />
						<span>{row.original.location}</span>
					</div>
				),
			},
			{
				id: "department",
				header: () => <span className={headerClass()}>Department</span>,
				accessorFn: (r) => r.department,
				cell: ({ row }) => (
					<span className="text-sm">{row.original.department}</span>
				),
			},
			{
				id: "startDate",
				header: () => <span className={headerClass()}>Start date</span>,
				accessorFn: (r) => r.startDate,
				cell: ({ row }) => (
					<div className="text-muted-foreground flex items-center gap-2 text-sm w-32">
						<Calendar className="size-4 shrink-0" aria-hidden />
						<span>{row.original.startDate}</span>
					</div>
				),
			},
			{
				id: "endDate",
				header: () => <span className={headerClass()}>End date</span>,
				accessorFn: (r) => r.endDate,
				cell: ({ row }) => {
					const days = row.original.daysRemaining;
					return (
						<div className="space-y-0.5">
							<div className="text-muted-foreground flex items-center gap-2  w-32 text-sm">
								<Calendar className="size-4 shrink-0" aria-hidden />
								<span>{row.original.endDate}</span>
							</div>
							{days != null && days > 0 ? (
								<p className="text-xs font-medium text-amber-600 dark:text-amber-500">
									{days} days remaining
								</p>
							) : null}
						</div>
					);
				},
			},
			{
				id: "duration",
				header: () => <span className={headerClass()}>Duration</span>,
				accessorFn: (r) => r.durationWeeks,
				cell: ({ row }) => (
					<span className="text-sm">{row.original.durationWeeks} weeks</span>
				),
			},
			{
				id: "vendorRate",
				header: () => <span className={headerClass()}>Vendor rate</span>,
				accessorFn: (r) => r.vendorRatePerHour,
				cell: ({ row }) => (
					<span className="text-sm font-semibold text-green-600 dark:text-green-500">
						{formatUsdPerHour(row.original.vendorRatePerHour)}/hr
					</span>
				),
			},
			{
				id: "actions",
				header: () => (
					<span className="flex w-full justify-end pr-2 text-muted-foreground text-xs font-semibold uppercase tracking-wide">
						Actions
					</span>
				),
				enableSorting: false,
				cell: ({ row }) => (
					<div className="flex justify-end pr-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="text-primary gap-1.5"
							asChild
						>
							<Link href={`${detailBasePath}/${row.original.id}`}>
								<Eye className="size-4 shrink-0" aria-hidden />
								View
							</Link>
						</Button>
					</div>
				),
			},
		],
		[detailBasePath],
	);
}
