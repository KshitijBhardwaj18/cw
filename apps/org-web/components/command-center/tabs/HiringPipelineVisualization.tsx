"use client";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@repo/ui/components/chart";
import { BarChart3 } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import type { HiringFunnelSummaryKey } from "@/types/command-center";

const PIPELINE_ORDER: { key: HiringFunnelSummaryKey; label: string }[] = [
	{ key: "submitted", label: "Submitted" },
	{ key: "qualified", label: "Qualified" },
	{ key: "shortlisted", label: "Shortlisted" },
	{ key: "offers", label: "Offers" },
	{ key: "placed", label: "Placed" },
	{ key: "rejected", label: "Rejected" },
];

const chartConfig = {
	submitted: { label: "Submitted", color: "hsl(217 91% 60%)" },
	qualified: { label: "Qualified", color: "hsl(142 71% 45%)" },
	shortlisted: { label: "Shortlisted", color: "hsl(38 92% 50%)" },
	offers: { label: "Offers", color: "hsl(84 81% 44%)" },
	placed: { label: "Placed", color: "hsl(263 70% 58%)" },
	rejected: { label: "Rejected", color: "hsl(0 84% 60%)" },
	count: { label: "Count" },
} satisfies ChartConfig;

function getStageColor(key: HiringFunnelSummaryKey): string {
	const entry = chartConfig[key];
	return entry && "color" in entry && entry.color ? entry.color : "transparent";
}

type HiringPipelineVisualizationProps = {
	summaryByKey: Record<
		HiringFunnelSummaryKey,
		{ value: number; helperText: string }
	>;
};

export function HiringPipelineVisualization({
	summaryByKey,
}: Readonly<HiringPipelineVisualizationProps>) {
	const { chartData, yAxisMax } = useMemo(() => {
		const submitted = summaryByKey.submitted.value;
		const rows = PIPELINE_ORDER.map(({ key, label }) => {
			const count = summaryByKey[key].value;
			const pct = submitted > 0 ? Math.round((count / submitted) * 100) : 0;
			return {
				key,
				label,
				count,
				pct,
				fill: `var(--color-${key})`,
			};
		});
		const maxCount = Math.max(...rows.map((r) => r.count), 1);
		const yAxisMax = Math.max(100, Math.ceil(maxCount / 25) * 25);
		return { chartData: rows, yAxisMax };
	}, [summaryByKey]);

	const yTicks = yAxisMax === 100 ? [0, 25, 50, 75, 100] : undefined;

	return (
		<Card className="border ">
			<CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
				<BarChart3
					className="text-muted-foreground size-5 shrink-0"
					aria-hidden
				/>
				<CardTitle className="font-semibold text-lg leading-none">
					Hiring Pipeline Visualization
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 pb-2">
				<ChartContainer
					config={chartConfig}
					className="[&_.recharts-label]:fill-muted-foreground aspect-auto h-[280px] w-full"
				>
					<BarChart
						data={chartData}
						margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
					>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							dataKey="label"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
						/>
						<YAxis
							domain={[0, yAxisMax]}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							ticks={yTicks}
							label={{
								value: "Count",
								angle: -90,
								position: "insideLeft",
								offset: 8,
							}}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									labelFormatter={(_, payload) => {
										const item = payload?.[0]?.payload as
											| { label?: string }
											| undefined;
										return item?.label ?? "";
									}}
								/>
							}
						/>
						<Bar dataKey="count" radius={[4, 4, 0, 0]}>
							{chartData.map((entry) => (
								<Cell key={entry.key} fill={entry.fill} />
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className="border-border/50 flex flex-col gap-4 border-t px-6 pt-4">
				<div className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-3">
					{chartData.map((row) => (
						<div
							key={row.key}
							className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
						>
							<span
								className="size-2.5 shrink-0 rounded-full"
								style={{ backgroundColor: getStageColor(row.key) }}
							/>
							<span className="text-muted-foreground">{row.label}</span>
							<span className="font-semibold tabular-nums">{row.count}</span>
							<span className="text-muted-foreground text-xs tabular-nums">
								{row.pct}%
							</span>
						</div>
					))}
				</div>
			</CardFooter>
		</Card>
	);
}
