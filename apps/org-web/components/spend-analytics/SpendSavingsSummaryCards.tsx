"use client";

import { formatCurrency } from "@repo/shared";
import { TintedMetricCard } from "@repo/ui/general/TintedMetricCard";
import { cn } from "@repo/ui/lib/utils";

export type SpendSavingsSummaryCardsProps = {
	avgPerCenterUsd: number;
	topCostCenterName: string;
	projectedAnnualUsd: number;
	className?: string;
};

export function SpendSavingsSummaryCards({
	avgPerCenterUsd,
	topCostCenterName,
	projectedAnnualUsd,
	className,
}: Readonly<SpendSavingsSummaryCardsProps>) {
	return (
		<div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}>
			<TintedMetricCard
				tone="emerald"
				title="Avg Savings per Department"
				value={formatCurrency(avgPerCenterUsd)}
			/>
			<TintedMetricCard
				tone="sky"
				title="Top Performing Department"
				value={topCostCenterName}
			/>
			<TintedMetricCard
				tone="violet"
				title="Projected Annual Savings"
				value={formatCurrency(projectedAnnualUsd)}
			/>
		</div>
	);
}
