"use client";

import { formatDate } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { HolidayEntry } from "../types";

function holidayRowDate(row: HolidayEntry): string | undefined {
	return row.observedOn ?? row.date;
}

export function useHolidayColumns() {
	const columns = useMemo<ColumnDef<HolidayEntry>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Holiday Name",
				cell: ({ row }) => (
					<span className="font-semibold text-foreground">
						{row.getValue("name")}
					</span>
				),
			},
			{
				id: "date",
				header: "Date",
				cell: ({ row }) => {
					const raw = holidayRowDate(row.original);
					return (
						<span className="text-muted-foreground whitespace-nowrap">
							{raw ? formatDate(raw) : "—"}
						</span>
					);
				},
			},
			{
				id: "dayOfWeek",
				header: "Day of Week",
				cell: ({ row }) => {
					const raw = holidayRowDate(row.original);
					return (
						<div className="text-muted-foreground">
							{raw ? formatDate(raw, "EEEE") : "—"}
						</div>
					);
				},
			},
			{
				id: "type",
				header: "Type",
				cell: ({ row }) => {
					const val = (row.original.holidayType ?? "Holiday") as string;
					const isFederal = val.toLowerCase().includes("federal");
					return <Badge variant={isFederal ? "info" : "success"}>{val}</Badge>;
				},
			},
		],
		[],
	);

	return { columns };
}
