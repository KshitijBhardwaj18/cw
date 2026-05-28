"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Switch } from "@repo/ui/components/switch";
import { cn } from "@repo/ui/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { OrgMetricKpi } from "@/constants/metrics-reporting";

type RecruitmentEfficiencyKpiCardProps = {
	kpi: OrgMetricKpi;
	canUpdate: boolean;
	onStatusChange: (id: string, enabled: boolean) => void;
	onEditGoal: (kpi: OrgMetricKpi) => void;
};

function TrendIcon({ trend }: Readonly<{ trend: OrgMetricKpi["trend"] }>) {
	if (trend === "up") {
		return (
			<TrendingUp
				className="size-5 shrink-0 text-green-600 dark:text-green-500"
				aria-hidden
			/>
		);
	}
	if (trend === "down") {
		return (
			<TrendingDown
				className="size-5 shrink-0 text-red-600 dark:text-red-500"
				aria-hidden
			/>
		);
	}
	return (
		<Minus className="text-muted-foreground size-5 shrink-0" aria-hidden />
	);
}

export function RecruitmentEfficiencyKpiCard({
	kpi,
	canUpdate,
	onStatusChange,
	onEditGoal,
}: Readonly<RecruitmentEfficiencyKpiCardProps>) {
	return (
		<Card className="gap-0">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="text-base font-semibold">{kpi.name}</CardTitle>
					<div className="flex shrink-0 items-center gap-2">
						{canUpdate && (
							<Switch
								checked={kpi.enabled}
								onCheckedChange={(checked) => onStatusChange(kpi.id, checked)}
								aria-label={
									kpi.enabled ? `Disable ${kpi.name}` : `Enable ${kpi.name}`
								}
							/>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent
				className={cn(
					"flex flex-col gap-3 pt-0 transition-opacity",
					!kpi.enabled && "opacity-50",
				)}
			>
				<div>
					<p className="text-muted-foreground text-sm">Goal:</p>
					<p className="text-primary text-2xl font-bold">{kpi.goalDisplay}</p>
				</div>

				<div className="bg-muted flex items-center justify-between gap-3 rounded-md px-3 py-2.5">
					<div className="min-w-0">
						<span className="text-sm">Current: </span>
						<span className="text-sm font-bold">{kpi.currentDisplay}</span>
					</div>
					<TrendIcon trend={kpi.trend} />
				</div>

				<Button
					type="button"
					variant="secondary"
					className="w-full"
					onClick={() => onEditGoal(kpi)}
				>
					Edit Goal
				</Button>
			</CardContent>
		</Card>
	);
}
