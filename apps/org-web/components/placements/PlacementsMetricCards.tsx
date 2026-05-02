"use client";

import { MetricCard } from "@repo/ui/general/MetricCard";
import { Briefcase, CalendarClock, UserCheck, Users } from "lucide-react";
import type { PlacementMetricStats } from "@/types/placements";

export interface PlacementsMetricCardsProps {
	stats: PlacementMetricStats;
}

export function PlacementsMetricCards({ stats }: PlacementsMetricCardsProps) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<MetricCard
				title="Total Placements"
				value={stats.totalPlacements}
				icon={Users}
			/>
			<MetricCard
				variant="success"
				title="Active"
				value={stats.active}
				icon={Briefcase}
			/>
			<MetricCard
				variant="warning"
				title="Ending Soon"
				value={stats.endingSoon}
				icon={CalendarClock}
			/>
			<MetricCard
				variant="inactive"
				title="Completed"
				value={stats.completed}
				icon={UserCheck}
			/>
		</div>
	);
}
