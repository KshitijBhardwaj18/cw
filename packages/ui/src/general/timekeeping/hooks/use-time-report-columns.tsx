"use client";

import { formatDateRange } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { FileUp, Smartphone } from "lucide-react";
import { useMemo } from "react";
import { PAY_CODE_BADGE_VARIANT } from "../constants";
import type { TimeReportEntry, TimeReportGroupByOption } from "../types";

export function useTimeReportColumns(groupBy: TimeReportGroupByOption) {
	const columns = useMemo<ColumnDef<TimeReportEntry>[]>(
		() => [
			{
				accessorKey: "workerName",
				header: "WORKER",
				cell: ({ row }) => (
					<span className="font-medium">{row.original.workerName}</span>
				),
			},
			...(groupBy !== "location" && groupBy !== "department"
				? [
						{
							accessorKey: "location",
							header: "LOCATION",
						} as ColumnDef<TimeReportEntry>,
					]
				: []),
			...(groupBy !== "department"
				? [
						{
							accessorKey: "department",
							header: "DEPARTMENT",
						} as ColumnDef<TimeReportEntry>,
					]
				: []),
			...(groupBy !== "date"
				? [
						{
							accessorKey: "startDate",
							header: "DATE",
							cell: ({ row }) => (
								<span className="text-muted-foreground whitespace-nowrap">
									{formatDateRange(
										row.original.startDate,
										row.original.endDate,
									)}
								</span>
							),
						} as ColumnDef<TimeReportEntry>,
					]
				: []),
			...(groupBy !== "payCode"
				? [
						{
							accessorKey: "payCode",
							header: "PAY CODE",
							cell: ({ row }) => (
								<Badge
									variant={
										PAY_CODE_BADGE_VARIANT[row.original.payCode] ?? "outline"
									}
								>
									{row.original.payCode}
								</Badge>
							),
						} as ColumnDef<TimeReportEntry>,
					]
				: []),
			{
				accessorKey: "hours",
				header: "HOURS",
				cell: ({ row }) => row.original.hours,
			},
			{
				accessorKey: "source",
				header: "SOURCE",
				cell: ({ row }) => (
					<Badge
						variant={row.original.source === "MOBILE_APP" ? "info" : "inactive"}
					>
						{row.original.source === "MOBILE_APP" ? (
							<Smartphone className="size-3" />
						) : (
							<FileUp className="size-3" />
						)}
						{row.original.source === "MOBILE_APP"
							? "Mobile App"
							: "File Upload"}
					</Badge>
				),
			},
			{
				accessorKey: "notes",
				header: "NOTES",
				cell: ({ row }) => (
					<span className="text-muted-foreground">
						{row.original.notes ?? "—"}
					</span>
				),
			},
		],
		[groupBy],
	);

	return { columns };
}
