"use client";

import { MetricCard } from "@repo/ui/general/MetricCard";
import { CheckCircle2, Clock3, FileText, UserPlus } from "lucide-react";
import type { VendorCandidateMetrics } from "@/types/vendor-candidates";

export interface CandidatesMetricCardsProps {
	stats: VendorCandidateMetrics;
}

export function CandidatesMetricCards({ stats }: CandidatesMetricCardsProps) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<MetricCard
				variant="info"
				title="Total Candidates"
				value={stats.totalCandidates}
				icon={UserPlus}
			/>
			<MetricCard
				variant="success"
				title="Active"
				value={stats.active}
				icon={CheckCircle2}
			/>
			<MetricCard
				variant="warning"
				title="Onboarding"
				value={stats.onboarding}
				icon={Clock3}
			/>
			<MetricCard
				variant="info"
				title="Docs Complete"
				value={stats.docsCompleteLabel}
				icon={FileText}
			/>
		</div>
	);
}
