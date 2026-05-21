"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { MetricCard } from "@repo/ui/general/MetricCard";
import { cn } from "@repo/ui/lib/utils";
import type { PlacementMetricStats } from "@/types/placements";

export interface PlacementBottomSummaryCardProps {
	stats: PlacementMetricStats;
	className?: string;
}

export function PlacementBottomSummaryCard({
	stats,
	className,
}: PlacementBottomSummaryCardProps) {
	return (
		<Card className={cn("shadow-sm", className)}>
			<CardHeader>
				<CardTitle className="text-lg">Placement Summary</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<MetricCard
						title="Active assignments"
						value={stats.active}
						subLabel="Currently working"
						variant="primary"
					/>
					<MetricCard
						title="Expiring soon"
						value={stats.endingSoon}
						subLabel="Within 30 days"
						variant="warning"
					/>
					<MetricCard
						title="Total completed"
						value={stats.completed}
						subLabel="This quarter"
						variant="inactive"
					/>
				</div>
			</CardContent>
		</Card>
	);
}
