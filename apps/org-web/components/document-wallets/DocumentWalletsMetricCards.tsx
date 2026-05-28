"use client";

import { MetricCard } from "@repo/ui/general/MetricCard";
import { AlertTriangle, CheckCircle2, Clock3, FileText } from "lucide-react";
import type { DocumentWalletMetricStats } from "@/types/document-wallets";

export interface DocumentWalletsMetricCardsProps {
	stats: DocumentWalletMetricStats;
}

export function DocumentWalletsMetricCards({
	stats,
}: Readonly<DocumentWalletsMetricCardsProps>) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<MetricCard
				variant="info"
				title="Total Candidates"
				value={stats.totalCandidates}
				icon={FileText}
			/>
			<MetricCard
				variant="success"
				title="Complete"
				value={stats.complete}
				icon={CheckCircle2}
			/>
			<MetricCard
				variant="warning"
				title="In Progress"
				value={stats.inProgress}
				icon={Clock3}
			/>
			<MetricCard
				variant="error"
				title="Critical"
				value={stats.critical}
				icon={AlertTriangle}
			/>
		</div>
	);
}
