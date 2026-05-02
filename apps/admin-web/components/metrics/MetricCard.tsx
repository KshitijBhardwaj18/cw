"use client";

import type { Metric } from "@repo/db";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Switch } from "@repo/ui/components/switch";
import { cn } from "@repo/ui/lib/utils";

type MetricCardProps = {
	metric: Metric;
	onStatusChange: (id: string, status: boolean) => void;
	canUpdate: boolean;
};

export function MetricCard({
	metric,
	onStatusChange,
	canUpdate,
}: MetricCardProps) {
	return (
		<Card className="group relative gap-0">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="text-base font-semibold">
						{metric.name}
					</CardTitle>
					<div className="flex shrink-0 items-center gap-2">
						{canUpdate && (
							<Switch
								checked={metric.status}
								onCheckedChange={(checked) =>
									onStatusChange(metric.id, checked)
								}
								aria-label={`${metric.status ? "Disable" : "Enable"} ${metric.name}`}
							/>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent
				className={cn(
					"pt-0 transition-opacity opacity-50",
					metric.status && "opacity-100",
				)}
			>
				<div className="space-y-1">
					<span className="text-muted-foreground text-sm">Formula:</span>
					<div className="rounded-md bg-muted px-3 py-2 text-sm">
						{metric.formula}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
