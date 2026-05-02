"use client";

import { SpendProgressCard } from "@repo/ui/components/dashboard/SpendProgressCard";
import { StatCard } from "@repo/ui/components/dashboard/StatCard";
import { Building2, Handshake, MapPin, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useDashboardSummary } from "@/queries/dashboard.query";

const DashboardPageContent = () => {
	const { data: summary } = useDashboardSummary();
	return (
		<>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
				<Link href="/organizations" className="cursor-pointer">
					<StatCard
						title="Organizations"
						icon={Building2}
						value={summary?.totalOrganizations ?? 0}
					/>
				</Link>
				<StatCard
					title="Locations"
					icon={MapPin}
					value={summary?.totalLocations ?? 0}
				/>
				<Link href="/vendors" className="cursor-pointer">
					<StatCard
						title="Vendors"
						icon={Users}
						value={summary?.totalVendors ?? 0}
					/>
				</Link>
				<Link href="/users" className="cursor-pointer">
					<StatCard
						title="Users"
						icon={UserPlus}
						value={summary?.totalUsers ?? 0}
					/>
				</Link>
				<Link href="/msps" className="cursor-pointer">
					<StatCard
						title="MSP"
						icon={Handshake}
						value={summary?.totalChannelPartners ?? 0}
					/>
				</Link>
			</div>

			<SpendProgressCard
				current={summary?.totalSpend ?? 0}
				total={summary?.totalAvailableSpend ?? 0}
			/>
		</>
	);
};

export default DashboardPageContent;
