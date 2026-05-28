"use client";

import { MetricCard } from "@repo/ui/general/MetricCard";
import { Shield } from "lucide-react";
import type { VendorUserMetricStats } from "@/types/vendor-users";

export interface VendorUsersMetricCardsProps {
	stats: VendorUserMetricStats;
}

export function VendorUsersMetricCards({
	stats,
}: Readonly<VendorUsersMetricCardsProps>) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<MetricCard
				variant="info"
				title="Total Users"
				value={stats.totalUsers}
				icon={Shield}
			/>
			<MetricCard
				variant="success"
				title="Active Users"
				value={stats.activeUsers}
				icon={Shield}
			/>
			<MetricCard
				variant="error"
				title="Admins"
				value={stats.adminCount}
				icon={Shield}
			/>
			<MetricCard
				variant="primary"
				title="Recruiters"
				value={stats.recruiterCount}
				icon={Shield}
			/>
		</div>
	);
}
