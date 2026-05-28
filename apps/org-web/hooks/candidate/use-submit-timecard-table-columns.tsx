"use client";

import { Button } from "@repo/ui/components/button";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { TimePicker } from "@repo/ui/components/time-picker";
import type { ColumnDef } from "@tanstack/react-table";
import { Minus } from "lucide-react";
import { useMemo } from "react";
import type { TimeEntryRow } from "@/types/time-entry";
import {
	computeShiftHours,
	getTimeEntryRowAriaLabel,
} from "@/utils/time-entry";

const BREAK_OPTIONS = ["0", "15", "30", "45", "60"] as const;

export type SubmitTimecardTableColumnsOptions =
	| {
			variant: "placement";
			weekRange: { start: string; end: string };
			updateRow: (id: string, patch: Partial<TimeEntryRow>) => void;
			payCodeOptions: Array<{
				id: string;
				code: string;
				description: string;
			}>;
	  }
	| {
			variant: "shift";
			dateLabel: string;
			updateRow: (id: string, patch: Partial<TimeEntryRow>) => void;
			onRemoveOvertimeRow: (id: string) => void;
	  };

export function useSubmitTimecardTableColumns(
	options: SubmitTimecardTableColumnsOptions,
): ColumnDef<TimeEntryRow>[] {
	const variant = options.variant;
	const updateRow = options.updateRow;
	const weekRange = variant === "placement" ? options.weekRange : undefined;
	const payCodeOptions =
		variant === "placement" ? options.payCodeOptions : undefined;
	const dateLabel = variant === "shift" ? options.dateLabel : undefined;
	const onRemoveOvertimeRow =
		variant === "shift" ? options.onRemoveOvertimeRow : undefined;

	return useMemo(() => {
		const dateColumn: ColumnDef<TimeEntryRow> =
			variant === "placement" && weekRange
				? {
						id: "date",
						header: "Date",
						cell: ({ row }) => {
							const r = row.original;
							if (r.isOvertime) {
								return (
									<DatePicker
										value={r.workDate ?? ""}
										onChange={(v) => updateRow(r.id, { workDate: v })}
										placeholder="Pick date"
										min={weekRange.start}
										max={weekRange.end}
										className="h-9 w-full min-w-48 text-sm"
									/>
								);
							}
							return <span className="text-sm">{r.weekLabel}</span>;
						},
					}
				: {
						id: "date",
						header: "Date",
						cell: () => (
							<span className="text-muted-foreground text-sm">
								{dateLabel ?? ""}
							</span>
						),
					};

		const shared: ColumnDef<TimeEntryRow>[] = [
			dateColumn,
			{
				id: "start",
				header: "Start Time",
				cell: ({ row }) => {
					const r = row.original;
					return (
						<TimePicker
							id={`${r.id}-start`}
							value={r.start}
							onChange={(v) => updateRow(r.id, { start: v })}
							disabledOptions={r.end ? [r.end] : []}
							className="h-9 min-w-30 font-mono text-sm"
						/>
					);
				},
			},
			{
				id: "end",
				header: "End Time",
				cell: ({ row }) => {
					const r = row.original;
					return (
						<TimePicker
							id={`${r.id}-end`}
							value={r.end}
							onChange={(v) => updateRow(r.id, { end: v })}
							disabledOptions={r.start ? [r.start] : []}
							className="h-9 min-w-30 font-mono text-sm"
						/>
					);
				},
			},
			{
				id: "break",
				header: "Break (min)",
				cell: ({ row }) => {
					const r = row.original;
					const ariaDate = getTimeEntryRowAriaLabel(r);
					return (
						<Select
							value={r.breakMin}
							onValueChange={(v) => updateRow(r.id, { breakMin: v })}
						>
							<SelectTrigger
								className="w-full min-w-18"
								aria-label={`Break minutes for ${ariaDate}`}
							>
								<SelectValue placeholder="—" />
							</SelectTrigger>
							<SelectContent>
								{BREAK_OPTIONS.map((opt) => (
									<SelectItem key={opt} value={opt}>
										{opt}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					);
				},
			},
			{
				id: "dayTotal",
				header: () => (
					<span className="block w-full text-right">Total Hours</span>
				),
				cell: ({ row }) => {
					const r = row.original;
					const br = Number.parseInt(r.breakMin, 10);
					const breakMin = Number.isNaN(br) ? 0 : br;
					const dayTotal = computeShiftHours(r.start, r.end, breakMin);
					return (
						<span className="block text-right font-mono text-sm tabular-nums">
							{dayTotal.toFixed(2)}
						</span>
					);
				},
			},
		];

		if (variant === "placement") {
			shared.splice(4, 0, {
				id: "payCode",
				header: "Pay Code",
				cell: ({ row }) => {
					const r = row.original;
					return (
						<Select
							value={r.payCodeId ?? "__none__"}
							onValueChange={(v) =>
								updateRow(r.id, { payCodeId: v === "__none__" ? undefined : v })
							}
						>
							<SelectTrigger className="w-full min-w-40">
								<SelectValue placeholder="Select pay code" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="__none__">Select pay code</SelectItem>
								{(payCodeOptions ?? []).map((opt) => (
									<SelectItem key={opt.id} value={opt.id}>
										{opt.code}
										{opt.description ? ` - ${opt.description}` : ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					);
				},
			});
		}

		if (variant === "shift" && onRemoveOvertimeRow) {
			shared.push({
				id: "actions",
				header: () => <span className="sr-only">Remove</span>,
				cell: ({ row }) => {
					const r = row.original;
					if (!r.isOvertime) return null;
					return (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="size-7 text-muted-foreground hover:text-destructive"
							onClick={() => onRemoveOvertimeRow(r.id)}
							aria-label="Remove overtime row"
						>
							<Minus className="size-3.5" aria-hidden />
						</Button>
					);
				},
			});
		}

		return shared;
	}, [
		variant,
		updateRow,
		weekRange,
		payCodeOptions,
		dateLabel,
		onRemoveOvertimeRow,
	]);
}
