"use client";

import { formatCurrency } from "@repo/shared";
import {
	TINTED_METRIC_TONE_STYLES,
	TintedMetricCard,
} from "@repo/ui/general/TintedMetricCard";
import { cn } from "@repo/ui/lib/utils";
import {
	CalendarCheck2,
	CalendarClock,
	DollarSign,
	TrendingUp,
} from "lucide-react";
import type { SpendAnalyticsSummary } from "@/services/billing.service";

function iconWrap(
	tone: keyof typeof TINTED_METRIC_TONE_STYLES,
	Icon: typeof DollarSign,
) {
	const styles = TINTED_METRIC_TONE_STYLES[tone];
	return (
		<div
			className={cn(
				"flex size-7 shrink-0 items-center justify-center rounded-full",
				styles.iconWrap,
			)}
		>
			<Icon className="size-4" aria-hidden />
		</div>
	);
}

export type SpendSummaryStatCardsProps = {
	summary: SpendAnalyticsSummary | undefined;
	openSpend: number;
	committedSpend: number;
	totalSavings: number;
	spendDeltaPct?: number;
	isLoading: boolean;
};

export function SpendSummaryStatCards({
	summary,
	openSpend,
	committedSpend,
	totalSavings,
	spendDeltaPct,
	isLoading,
}: SpendSummaryStatCardsProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{[0, 1, 2, 3].map((i) => (
					<div
						key={i}
						className="bg-muted/40 h-28 animate-pulse rounded-xl border"
					/>
				))}
			</div>
		);
	}

	const s = summary ?? {
		rowCount: 0,
		totalSpend: 0,
		regularHours: 0,
		overtimeHours: 0,
		totalHours: 0,
		totalInvoices: 0,
		activePlacements: 0,
		permanentHeadcount: 0,
		contingentHeadcount: 0,
		contractorHeadcount: 0,
	};

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
			<TintedMetricCard
				tone="sky"
				title="Current Quarter Spend"
				value={formatCurrency(s.totalSpend)}
				titleTrailing={iconWrap("sky", DollarSign)}
				footer={
					<p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
						{spendDeltaPct != null
							? `${spendDeltaPct >= 0 ? "+" : ""}${spendDeltaPct.toFixed(1)}% vs last quarter`
							: "vs last quarter"}
					</p>
				}
			/>
			<TintedMetricCard
				tone="violet"
				title="Open Spend"
				value={formatCurrency(openSpend)}
				titleTrailing={iconWrap("violet", CalendarClock)}
				footer={
					<p className="text-muted-foreground mt-1 text-xs">
						No accepted offers
					</p>
				}
			/>
			<TintedMetricCard
				tone="amber"
				title="Committed Spend"
				value={formatCurrency(committedSpend)}
				titleTrailing={iconWrap("amber", CalendarCheck2)}
				footer={
					<p className="text-muted-foreground mt-1 text-xs">
						Accepted, not started
					</p>
				}
			/>
			<TintedMetricCard
				tone="emerald"
				title="Total Savings"
				value={formatCurrency(totalSavings)}
				titleTrailing={iconWrap("emerald", TrendingUp)}
				footer={
					<p className="text-muted-foreground mt-1 text-xs">Year to date</p>
				}
			/>
		</div>
	);
}
