"use client";

import { Badge } from "@repo/ui/components/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import type { PayCodeConfigEntry } from "../types";

/** Flat pay code row (mock grouped codes or API `PayCodeItem`). */
export type PayCodeTableRow = PayCodeConfigEntry & {
	category?: string;
};

export function usePayCodesColumns() {
	const columns = useMemo<ColumnDef<PayCodeTableRow>[]>(
		() => [
			{
				accessorKey: "category",
				header: "Category",
				cell: ({ row }) => (
					<span className="text-muted-foreground text-sm">
						{row.getValue("category")}
					</span>
				),
			},
			{
				accessorKey: "code",
				header: "Pay Code",
				cell: ({ row }) => (
					<span className="font-semibold text-foreground">
						{row.getValue("code")}
					</span>
				),
			},
			{
				accessorKey: "description",
				header: "Description",
				cell: ({ row }) => (
					<span className="text-muted-foreground">
						{row.getValue("description")}
					</span>
				),
			},
			{
				accessorKey: "multiplier",
				header: "Pay Multiplier",
				cell: ({ row }) => {
					const raw = row.getValue("multiplier");
					const val =
						typeof raw === "number" ? `${raw}x` : ((raw as string) ?? "—");
					const isVaries = val.toLowerCase() === "varies";
					const isStandard = val === "1x";
					return (
						<Badge
							variant="secondary"
							className={
								isVaries
									? "bg-amber-100 text-amber-700 hover:bg-amber-100"
									: isStandard
										? "bg-sky-50 text-sky-600 hover:bg-sky-50"
										: "bg-orange-50 text-orange-600 hover:bg-orange-50"
							}
						>
							{val}
						</Badge>
					);
				},
			},
		],
		[],
	);

	return { columns };
}
