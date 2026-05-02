"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { useSpendAnalyticsPage } from "@/hooks/use-spend-analytics-page";
import { SpendAnalyticsFiltersCard } from "./SpendAnalyticsFiltersCard";
import { SpendBreakdownTableSection } from "./SpendBreakdownTableSection";
import { SpendSavingsTableSection } from "./SpendSavingsTableSection";
import { SpendSummaryStatCards } from "./SpendSummaryStatCards";
import { SpendTrendComparisonCard } from "./SpendTrendComparisonCard";

export function SpendAnalyticsPageContent() {
	const {
		orgId,
		filterFields,
		filterValues,
		onFilterChange,
		summary,
		summaryLoading,
		isSpendFiltersPending,
		trendChartData,
		trendLoading,
		detailList,
		detailLoading,
		breakdown,
		breakdownLoading,
		openCommittedTotals,
		spendDeltaPct,
		totalSavings,
	} = useSpendAnalyticsPage();

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Spend Analytics"
				total={summary?.rowCount ?? 0}
				itemLabel="row"
				itemLabelPlural="rows"
				description="View your spend analytics and trends"
			/>

			<SpendAnalyticsFiltersCard
				fields={filterFields}
				values={filterValues}
				onChange={onFilterChange}
			/>

			<SpendSummaryStatCards
				summary={summary}
				openSpend={openCommittedTotals.open}
				committedSpend={openCommittedTotals.committed}
				totalSavings={totalSavings}
				spendDeltaPct={spendDeltaPct}
				isLoading={
					summaryLoading ||
					breakdownLoading ||
					detailLoading ||
					isSpendFiltersPending
				}
			/>

			<SpendTrendComparisonCard
				data={trendChartData}
				isLoading={trendLoading}
			/>

			<Tabs defaultValue="open-committed" className="gap-4 flex-col">
				<TabsList className="w-full">
					<TabsTrigger value="open-committed">Open vs Committed</TabsTrigger>
					<TabsTrigger value="savings">Savings Analysis</TabsTrigger>
				</TabsList>
				<TabsContent value="open-committed" className="space-y-6">
					<SpendBreakdownTableSection
						orgId={orgId}
						data={breakdown?.data ?? []}
						isLoading={breakdownLoading || isSpendFiltersPending}
					/>
				</TabsContent>
				<TabsContent value="savings" className="space-y-6">
					<SpendSavingsTableSection
						rows={detailList?.data ?? []}
						isLoading={detailLoading || isSpendFiltersPending}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
