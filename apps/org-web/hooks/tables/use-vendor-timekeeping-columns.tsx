"use client";

import { shortId } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { VENDOR_TIMEKEEPING_STATUS_CONFIG } from "@/constants/vendor-timekeeping";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { VendorTimekeepingEntry } from "@/types/vendor-timekeeping";
import { formatHHmmForDisplay } from "@/utils/time-entry";

export interface VendorTimekeepingColumnsParams {
	onEditRow?: (row: VendorTimekeepingEntry) => void;
}

export function useVendorTimekeepingColumns({
	onEditRow,
}: VendorTimekeepingColumnsParams = {}) {
	const { fmtCalendarDate } = useUserTimezone();

	const columns = useMemo<ColumnDef<VendorTimekeepingEntry>[]>(
		() => [
			{
				id: "candidate",
				header: "Candidate",
				cell: ({ row }) => {
					const entry = row.original;
					return (
						<div className="flex flex-col gap-0.5">
							<span>{entry.candidateName}</span>
							<span
								className="text-muted-foreground text-xs"
								title={entry.candidateId}
							>
								{shortId(entry.candidateId)}
							</span>
						</div>
					);
				},
			},
			{
				id: "job",
				header: "Job / Organization",
				cell: ({ row }) => {
					const entry = row.original;
					return (
						<div className="flex flex-col gap-0.5">
							<div className="flex flex-col">
								<span>{entry.jobTitle}</span>
							</div>
							<span className="text-muted-foreground">
								{entry.organization}
							</span>
						</div>
					);
				},
			},
			{
				accessorKey: "date",
				header: "Date",
				cell: ({ row }) => <span>{fmtCalendarDate(row.original.date)}</span>,
			},
			{
				accessorKey: "startTime",
				header: "Start Time",
				cell: ({ row }) => (
					<span>{formatHHmmForDisplay(row.original.startTime)}</span>
				),
			},
			{
				accessorKey: "endTime",
				header: "End Time",
				cell: ({ row }) => (
					<span>{formatHHmmForDisplay(row.original.endTime)}</span>
				),
			},
			{
				id: "totalHours",
				header: "Total Hours",
				cell: ({ row }) => (
					<span className=" ">{row.original.totalHours.toFixed(1)}h</span>
				),
			},
			{
				id: "note",
				header: "Note",
				cell: ({ row }) => (
					<span className="text-muted-foreground">
						{row.original.note || "-"}
					</span>
				),
			},
			{
				id: "status",
				header: "Status",
				cell: ({ row }) => {
					const status = row.original.vendorStatus;
					const config = VENDOR_TIMEKEEPING_STATUS_CONFIG[status];
					return <Badge variant={config.variant}>{config.label}</Badge>;
				},
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => {
					const canEdit =
						row.original.vendorStatus === "draft" ||
						row.original.vendorStatus === "submitted";
					if (!canEdit || !onEditRow) {
						return <span className="text-muted-foreground">—</span>;
					}
					return (
						<Button
							variant="ghost"
							size="icon"
							className="text-primary hover:text-primary size-8"
							onClick={() => onEditRow(row.original)}
							type="button"
						>
							<Pencil data-icon="inline" />
						</Button>
					);
				},
			},
		],
		[onEditRow, fmtCalendarDate],
	);

	return { columns };
}
