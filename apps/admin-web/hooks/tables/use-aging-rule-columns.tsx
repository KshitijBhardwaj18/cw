"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import type {
	AgingRuleIndicatorKind,
	AgingRuleRow,
} from "@/constants/metrics-reporting";

function IndicatorBadge({ kind }: { kind: AgingRuleIndicatorKind }) {
	if (kind === "overdue_submissions") {
		return (
			<Badge variant="warning" className="font-normal">
				<AlertTriangle className="size-3.5" />
				Overdue Submissions
			</Badge>
		);
	}
	if (kind === "overdue_offers") {
		return (
			<Badge variant="orange" className="font-normal">
				<AlertTriangle className="size-3.5" />
				Overdue Offers
			</Badge>
		);
	}
	return (
		<Badge
			variant="outline"
			className="border-rose-200 bg-rose-50 font-normal text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
		>
			<AlertCircle className="size-3.5" />
			Delayed / At-Risk
		</Badge>
	);
}

export type UseAgingRuleColumnsProps = {
	onEnabledChange: (id: string, enabled: boolean) => void;
	onEdit: (row: AgingRuleRow) => void;
};

export function useAgingRuleColumns({
	onEnabledChange,
	onEdit,
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
				accessorKey: "overdueAfter",
				header: () => (
					<span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
						Overdue After
					</span>
				),
			},
			{
				accessorKey: "unit",
				header: () => (
					<span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
						Unit
					</span>
				),
			},
			{
				id: "indicators",
				header: () => (
					<span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
						Indicators
					</span>
				),
				cell: ({ row }) => <IndicatorBadge kind={row.original.indicator} />,
			},
			{
				id: "status",
				header: () => (
					<span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
						Status
					</span>
				),
				cell: ({ row }) => (
					<Switch
						checked={row.original.enabled}
						onCheckedChange={(checked) =>
							onEnabledChange(row.original.id, checked)
						}
						aria-label={`Toggle rule ${row.original.stageLabel}`}
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
				cell: ({ row }) => (
					<Button
						type="button"
						variant="link"
						className="text-primary h-auto p-0 font-medium"
						onClick={() => onEdit(row.original)}
					>
						Edit Rule
					</Button>
				),
			},
		],
		[onEnabledChange, onEdit],
	);
	return { columns };
}
