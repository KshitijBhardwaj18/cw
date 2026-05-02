"use client";

import { formatCurrency } from "@repo/shared";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@repo/ui/components/chart";
import { Skeleton } from "@repo/ui/components/skeleton";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { BarChart as BarChartIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { SavingsByCostCenterRow } from "@/constants/spend-analytics";
import { SAVINGS_BY_CC_CHART_CONFIG } from "@/constants/spend-analytics";
import { useSavingsAnalysisColumns } from "@/hooks/tables/use-savings-analysis-columns";
import type { SpendAnalyticsRow } from "@/services/billing.service";
import { SpendSavingsSummaryCards } from "./SpendSavingsSummaryCards";

function niceBarAxisMax(maxVal: number): {
	domainMax: number;
	ticks: number[];
} {
	if (!Number.isFinite(maxVal) || maxVal <= 0) {
		return { domainMax: 60_000, ticks: [0, 15_000, 30_000, 45_000, 60_000] };
	}
	const step = Math.max(5000, Math.ceil(maxVal / 4 / 5000) * 5000);
	const domainMax = Math.ceil(maxVal / step) * step;
	const ticks: number[] = [];
	for (let t = 0; t <= domainMax; t += step) ticks.push(t);
	return { domainMax, ticks };
}

export type SpendSavingsTableSectionProps = {
	rows: SpendAnalyticsRow[];
	isLoading?: boolean;
};

export function SpendSavingsTableSection({
	rows,
	isLoading = false,
}: SpendSavingsTableSectionProps) {
	const [costCenterFilter, setCostCenterFilter] = useState("all");

	const allRows = useMemo((): SavingsByCostCenterRow[] => {
		const byKey = new Map<string, { label: string; amount: number }>();
		for (const r of rows) {
			const rawCc = r.department?.costCenter?.trim();
			const deptName = r.department?.name?.trim();
			const key = rawCc?.toLowerCase() || "unassigned";
			const label = rawCc
				? deptName
					? `${rawCc} - ${deptName}`
					: rawCc
				: deptName || "Unassigned";
			const cur = byKey.get(key) ?? { label, amount: 0 };
			cur.amount += r.totalSpend;
			if (!byKey.has(key)) byKey.set(key, cur);
		}
		const values = [...byKey.entries()]
			.map(([key, v]) => ({ key, ...v }))
			.sort((a, b) => b.amount - a.amount);
		const total = values.reduce((s, v) => s + v.amount, 0);
		return values.map((v) => {
			const pct = total > 0 ? (v.amount / total) * 100 : 0;
			return {
				id: v.key,
				costCenterKey: v.key,
				costCenterLabel: v.label,
				savingsAmount: v.amount,
				trend: pct >= 10 ? "high-impact" : "moderate",
			};
		});
	}, [rows]);

	const filteredRows = useMemo(
		() =>
			costCenterFilter === "all"
				? allRows
				: allRows.filter((r) => r.costCenterKey === costCenterFilter),
		[allRows, costCenterFilter],
	);

	const visibleTotal = useMemo(
		() => filteredRows.reduce((acc, r) => acc + r.savingsAmount, 0),
		[filteredRows],
	);

	const chartData = useMemo(
		() =>
			filteredRows.map((r) => ({
				...r,
				fill: "var(--color-savings)",
			})),
		[filteredRows],
	);

	const { domainMax, ticks } = useMemo(() => {
		const maxBar = Math.max(0, ...filteredRows.map((r) => r.savingsAmount));
		return niceBarAxisMax(maxBar);
	}, [filteredRows]);

	const avgPerDept = useMemo(() => {
		if (filteredRows.length === 0) return 0;
		return visibleTotal / filteredRows.length;
	}, [filteredRows, visibleTotal]);

	const topCostCenterName = useMemo(() => {
		const label = filteredRows[0]?.costCenterLabel ?? "—";
		return label.includes(" - ") ? label.split(" - ")[1] || label : label;
	}, [filteredRows]);

	const annualizedSpend = useMemo(() => visibleTotal * 4, [visibleTotal]);

	const columns = useSavingsAnalysisColumns({
		pctDenominator: visibleTotal,
	});

	const costCenterOptions = useMemo(
		() =>
			allRows.map((r) => ({
				value: r.costCenterKey,
				label: r.costCenterLabel,
			})),
		[allRows],
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="font-semibold text-lg">
					Savings Analysis by Cost Center
				</CardTitle>
				<CardDescription>
					Savings generated from canceled requisitions, avoided costs, and
					optimized workforce management
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex w-fit items-center gap-3 rounded-lg border px-3 py-2">
					<span className="text-sm font-semibold">Filter by Cost Center:</span>
					<select
						className="bg-background rounded-md border px-2 py-1 text-sm"
						value={costCenterFilter}
						onChange={(e) => setCostCenterFilter(e.target.value)}
					>
						<option value="all">All Cost Centers</option>
						{costCenterOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>

				{isLoading ? (
					<Skeleton className="aspect-auto h-[300px] w-full rounded-md" />
				) : (
					<div className="bg-muted/20 rounded-xl border p-4 pb-2">
						<div className="mb-3 flex flex-row items-center gap-2">
							<BarChartIcon
								className="text-muted-foreground size-5 shrink-0"
								aria-hidden
							/>
							<p className="text-foreground text-sm font-medium">
								Savings trend by cost center
							</p>
						</div>
						{filteredRows.length === 0 ? (
							<p className="text-muted-foreground py-12 text-center text-sm">
								No savings data for this period or filter.
							</p>
						) : (
							<ChartContainer
								config={SAVINGS_BY_CC_CHART_CONFIG}
								className="[&_.recharts-label]:fill-muted-foreground aspect-auto h-[300px] w-full"
							>
								<BarChart
									data={chartData}
									margin={{ top: 20, right: 12, left: 4, bottom: 16 }}
								>
									<CartesianGrid strokeDasharray="3 3" vertical={false} />
									<XAxis
										dataKey="costCenterLabel"
										tickLine={false}
										axisLine={false}
										tickMargin={10}
										interval={0}
										height={72}
										angle={-15}
										textAnchor="end"
										tick={{ fontSize: 10 }}
									/>
									<YAxis
										domain={[0, domainMax]}
										ticks={ticks}
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										tickFormatter={(v) =>
											v >= 1_000_000
												? `$${(v / 1_000_000).toFixed(1)}M`
												: `$${Math.round(v / 1000)}K`
										}
									/>
									<ChartTooltip
										cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }}
										content={
											<ChartTooltipContent
												hideIndicator
												className="min-w-[220px] gap-2 border-slate-200 bg-white px-3 py-3 shadow-md dark:border-slate-700 dark:bg-zinc-950"
												labelClassName="text-slate-900 dark:text-slate-100"
												labelFormatter={(_, payload) => {
													const row = payload?.[0]?.payload as
														| { costCenterLabel?: string }
														| undefined;
													return (
														<span className="font-semibold text-base text-slate-900 dark:text-slate-100">
															{row?.costCenterLabel ?? ""}
														</span>
													);
												}}
												formatter={(value) => (
													<span className="font-medium text-primary dark:text-emerald-300">
														Savings : {formatCurrency(Number(value))}
													</span>
												)}
											/>
										}
									/>
									<Bar
										dataKey="savingsAmount"
										name="savings"
										fill="var(--color-savings)"
										maxBarSize={80}
									/>
								</BarChart>
							</ChartContainer>
						)}
					</div>
				)}

				{isLoading ? (
					<div className="space-y-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				) : (
					<>
						<CustomTable
							data={filteredRows}
							columns={columns}
							enableSorting
							enablePagination
							paginationMode="client"
							pageSize={10}
							className="rounded-none border-0 border-b-0"
							emptyState={
								<p className="text-muted-foreground py-8 text-center text-sm">
									No rows to show.
								</p>
							}
						/>
						<div className="bg-muted/30 flex flex-wrap items-center justify-end gap-6 border-t px-4 py-3 text-sm">
							<span className="text-muted-foreground font-medium">Total:</span>
							<span className="font-semibold text-emerald-700 tabular-nums dark:text-emerald-300">
								{formatCurrency(visibleTotal)}
							</span>
						</div>

						<SpendSavingsSummaryCards
							avgPerCenterUsd={avgPerDept}
							topCostCenterName={topCostCenterName}
							projectedAnnualUsd={annualizedSpend}
						/>
					</>
				)}
			</CardContent>
		</Card>
	);
}
