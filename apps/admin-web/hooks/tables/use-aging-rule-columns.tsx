"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import type { ColumnDef } from "@tanstack/react-table";
import {
	AlertCircle,
	AlertTriangle,
	CalendarClock,
	Clock3,
	Hourglass,
	Inbox,
	Pencil,
	Trash2,
	UserRoundSearch,
} from "lucide-react";
import { useMemo } from "react";
import type {
	AgingRuleIndicatorKey,
	AgingRuleRow,
} from "@/constants/metrics-reporting";

const INDICATOR_META: Record<
	AgingRuleIndicatorKey,
	{
		label: string;
		icon: typeof AlertTriangle;
		className: string;
	}
> = {
	"overdue-submissions": {
		label: "Overdue Submissions",
		icon: AlertTriangle,
		className:
			"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
	},
	"aging-qualified": {
		label: "Aging Qualified",
		icon: UserRoundSearch,
		className:
			"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
	},
	"aging-shortlisted": {
		label: "Aging Shortlisted",
		icon: Hourglass,
		className:
			"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
	},
	"interview-delayed": {
		label: "Interview Delayed",
		icon: CalendarClock,
		className:
			"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
	},
	"offer-pending": {
		label: "Offer Pending",
		icon: Inbox,
		className:
			"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
	},
	"overdue-offers": {
		label: "Overdue Offers",
		icon: Clock3,
		className:
			"border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
	},
	"delayed-onboarding": {
		label: "Delayed / At-Risk Onboarding",
		icon: AlertCircle,
		className:
			"border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
	},
};

function IndicatorBadge({
	indicator,
}: Readonly<{ indicator: AgingRuleIndicatorKey }>) {
	const meta = INDICATOR_META[indicator];
	const Icon = meta.icon;
	return (
		<Badge variant="outline" className={`font-normal ${meta.className}`}>
			<Icon className="size-3.5" />
			{meta.label}
		</Badge>
	);
}

export type UseAgingRuleColumnsProps = {
	onEnabledChange: (row: AgingRuleRow, enabled: boolean) => void;
	onEdit: (row: AgingRuleRow) => void;
	onDelete: (row: AgingRuleRow) => void;
};

export function useAgingRuleColumns({
	onEnabledChange,
	onEdit,
	onDelete,
}: UseAgingRuleColumnsProps) {
	const columns = useMemo<ColumnDef<AgingRuleRow, unknown>[]>(
		() => [
			{
				accessorKey: "stageLabel",
				header: () => (
					<span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
						Stage
					</span>
				),
				cell: ({ row }) => (
					<span className="font-medium">{row.original.stageLabel}</span>
				),
			},
			{
				accessorKey: "indicator",
				header: () => (
					<span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
						Indicator
					</span>
				),
				cell: ({ row }) => (
					<IndicatorBadge indicator={row.original.indicator} />
				),
			},
			{
				accessorKey: "overdueAfter",
				header: () => (
					<span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
						Overdue After
					</span>
				),
				cell: ({ row }) => (
					<span className="text-sm">
						{row.original.overdueAfter} {row.original.unit.toLowerCase()}
					</span>
				),
			},
			{
				accessorKey: "enabled",
				header: () => (
					<span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
						Enabled
					</span>
				),
				cell: ({ row }) => (
					<Switch
						checked={row.original.enabled}
						onCheckedChange={(checked) =>
							onEnabledChange(row.original, checked)
						}
						aria-label={`Toggle ${row.original.stageLabel}`}
					/>
				),
			},
			{
				id: "actions",
				header: () => (
					<span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
						Actions
					</span>
				),
				enableSorting: false,
				cell: ({ row }) => (
					<div className="flex justify-end gap-1">
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => onEdit(row.original)}
							aria-label={`Edit ${row.original.stageLabel}`}
						>
							<Pencil className="size-4" />
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="text-destructive hover:text-destructive"
							onClick={() => onDelete(row.original)}
							aria-label={`Delete ${row.original.stageLabel}`}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				),
			},
		],
		[onEnabledChange, onEdit, onDelete],
	);
	return { columns };
}
