"use client";

import { formatCurrency } from "@repo/shared";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@repo/ui/components/chart";
import { Skeleton } from "@repo/ui/components/skeleton";
import { LineChart as LineChartIcon } from "lucide-react";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { SPEND_TREND_CHART_CONFIG } from "@/constants/spend-analytics";

export type SpendTrendChartPoint = {
	month: string;
	currentQuarter: number;
	lastQuarter: number;
};

export type SpendTrendComparisonCardProps = {
	data: SpendTrendChartPoint[];
	isLoading?: boolean;
};

function niceYAxisMax(maxVal: number): { domainMax: number; step: number } {
	if (!Number.isFinite(maxVal) || maxVal <= 0) {
		return { domainMax: 100_000, step: 25_000 };
	}
	const rawStep = Math.max(5000, Math.ceil(maxVal / 5 / 5000) * 5000);
	const domainMax = Math.max(rawStep, Math.ceil(maxVal / rawStep) * rawStep);
	return { domainMax, step: rawStep };
}

export function SpendTrendComparisonCard({
	data,
	isLoading = false,
}: SpendTrendComparisonCardProps) {
	const { domainMax, yTicks } = useMemo(() => {
		const maxVal = Math.max(
			0,
			...data.flatMap((d) => [d.currentQuarter, d.lastQuarter]),
		);
		const { domainMax: dm, step: s } = niceYAxisMax(maxVal);
		const ticks: number[] = [];
		for (let t = 0; t <= dm; t += s) ticks.push(t);
		return { domainMax: dm, yTicks: ticks };
	}, [data]);

	const isEmpty =
		!isLoading &&
		data.length > 0 &&
		data.every((d) => d.currentQuarter === 0 && d.lastQuarter === 0);

	return (
		<Card className="border shadow-sm">
			<CardHeader className="space-y-1 pb-2">
				<div className="flex flex-row items-center gap-2">
					<LineChartIcon
						className="text-muted-foreground size-5 shrink-0"
						aria-hidden
					/>
					<CardTitle className="font-semibold text-lg leading-none">
						Spend Trend Comparison
					</CardTitle>
				</div>
				<CardDescription>Current Quarter vs Last Quarter</CardDescription>
			</CardHeader>
			<CardContent className="pb-2">
				{isLoading ? (
					<Skeleton className="aspect-auto h-[280px] w-full rounded-md" />
				) : isEmpty ? (
					<p className="text-muted-foreground py-12 text-center text-sm">
						No spend in the current or prior quarter for this view.
					</p>
				) : (
					<ChartContainer
						config={SPEND_TREND_CHART_CONFIG}
						className="[&_.recharts-label]:fill-muted-foreground aspect-auto h-[280px] w-full"
					>
						<LineChart
							data={data}
							margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
						>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis
								dataKey="month"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
							/>
							<YAxis
								domain={[0, domainMax]}
								ticks={yTicks}
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
								cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
								content={
									<ChartTooltipContent
										hideIndicator
										className="min-w-[220px] gap-2 border-slate-200 bg-white px-3 py-3 shadow-md dark:border-slate-700 dark:bg-zinc-950"
										labelClassName="text-slate-900 dark:text-slate-100"
										labelFormatter={(monthLabel) => (
											<span className="font-semibold text-base text-slate-900 dark:text-slate-100">
												{String(monthLabel)}
											</span>
										)}
										formatter={(value, _name, item) => {
											const isCurrent = item.dataKey === "currentQuarter";
											const seriesLabel = isCurrent
												? "Current Quarter"
												: "Last Quarter";
											return (
												<span
													className={
														isCurrent
															? "font-medium text-primary dark:text-[hsl(173_50%_52%)]"
															: "font-medium text-slate-400 dark:text-slate-500"
													}
												>
													{seriesLabel} : {formatCurrency(Number(value))}
												</span>
											);
										}}
									/>
								}
							/>
							<Line
								type="monotone"
								dataKey="currentQuarter"
								name="currentQuarter"
								stroke="var(--color-currentQuarter)"
								strokeWidth={2}
								dot={{ r: 4 }}
								activeDot={{ r: 5 }}
							/>
							<Line
								type="monotone"
								dataKey="lastQuarter"
								name="lastQuarter"
								stroke="var(--color-lastQuarter)"
								strokeWidth={2}
								strokeDasharray="6 4"
								dot={{ r: 4 }}
								activeDot={{ r: 5 }}
							/>
						</LineChart>
					</ChartContainer>
				)}
			</CardContent>
			<CardFooter className="border-border/50 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t pt-4">
				<div className="flex items-center gap-2 text-sm">
					<span
						className="inline-block h-0.5 w-8 rounded-full bg-[hsl(173_58%_38%)]"
						aria-hidden
					/>
					<span className="text-muted-foreground">Current Quarter</span>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<span
						className="inline-block h-0.5 w-8 rounded-full border border-dashed border-[hsl(215_14%_52%)] bg-transparent"
						aria-hidden
					/>
					<span className="text-muted-foreground">Last Quarter</span>
				</div>
			</CardFooter>
		</Card>
	);
}
