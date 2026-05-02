"use client";

import { Badge } from "@repo/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, MapPin } from "lucide-react";
import { useMemo } from "react";
import type { HiringFunnelJobListingItem } from "@/types/command-center";

function MetricCell({
	count,
	conversionRate,
	variant,
}: {
	count: number;
	conversionRate: number;
	variant: "success" | "warning" | "lime" | "error" | "violet";
}) {
	return (
		<div className="space-y-0.5">
			<Badge variant={variant} className="rounded-none">
				{count}
			</Badge>
			<p className="text-muted-foreground text-xs">{conversionRate}%</p>
		</div>
	);
}

export const useHiringFunnelJobListingColumns = () => {
	const columns = useMemo<ColumnDef<HiringFunnelJobListingItem>[]>(
		() => [
			{
				accessorKey: "jobTitle",
				header: "Job Title",
				cell: ({ row }) => (
					<div className="space-y-1">
						<p className="font-medium">{row.original.jobTitle}</p>
						<Badge
							variant={row.original.status === "open" ? "success" : "inactive"}
							className="rounded-none"
						>
							{row.original.status === "open" ? "Open" : "Closed"}
						</Badge>
					</div>
				),
			},
			{
				accessorKey: "location",
				header: "Location",
				cell: ({ row }) => (
					<div className="text-muted-foreground flex items-center gap-2">
						<MapPin className="size-4" />
						<span>{row.original.location}</span>
					</div>
				),
			},
			{
				accessorKey: "department",
				header: "Department",
				cell: ({ row }) => (
					<div className="text-muted-foreground flex items-center gap-2">
						<Building2 className="size-4" />
						<span>{row.original.department}</span>
					</div>
				),
			},
			{
				accessorKey: "submitted",
				header: "Submitted",
				cell: ({ row }) => (
					<Badge variant="info" className="rounded-none">
						{row.original.submitted}
					</Badge>
				),
			},
			{
				accessorKey: "qualified",
				header: "Qualified",
				cell: ({ row }) => (
					<MetricCell
						count={row.original.qualified.count}
						conversionRate={row.original.qualified.conversionRate}
						variant="success"
					/>
				),
			},
			{
				accessorKey: "shortlisted",
				header: "Shortlisted",
				cell: ({ row }) => (
					<MetricCell
						count={row.original.shortlisted.count}
						conversionRate={row.original.shortlisted.conversionRate}
						variant="warning"
					/>
				),
			},
			{
				accessorKey: "offers",
				header: "Offers",
				cell: ({ row }) => (
					<MetricCell
						count={row.original.offers.count}
						conversionRate={row.original.offers.conversionRate}
						variant="lime"
					/>
				),
			},
			{
				accessorKey: "rejected",
				header: "Rejected",
				cell: ({ row }) => (
					<MetricCell
						count={row.original.rejected.count}
						conversionRate={row.original.rejected.conversionRate}
						variant="error"
					/>
				),
			},
			{
				accessorKey: "placed",
				header: "Placed",
				cell: ({ row }) => (
					<MetricCell
						count={row.original.placed.count}
						conversionRate={row.original.placed.conversionRate}
						variant="violet"
					/>
				),
			},
		],
		[],
	);

	return { columns };
};
