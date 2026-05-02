"use client";

import { Action } from "@repo/casl";
import { VendorUserRole } from "@repo/shared";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { PageSubheading } from "@repo/ui/general/PageSubheading";
import {
	Award,
	Briefcase,
	Clock,
	FileText,
	Target,
	TrendingUp,
	Users,
} from "lucide-react";
import { useMemo } from "react";
import { QUICK_ACTIONS } from "@/constants/vendor/dashboard";
import { useAuth } from "@/contexts/auth.context";
import { useVendorDashboardQuery } from "@/queries/vendor-dashboard.queries";
import { ComplianceAlerts } from "./ComplianceAlerts";
import { FinancialOverview } from "./FinancialOverview";
import { InvoiceStatus } from "./InvoiceStatus";
import { OffersOverview } from "./OffersOverview";
import { QuickActionCard } from "./QuickActionCard";
import { RecentActivity } from "./RecentActivity";
import { StatCard } from "./StatCard";
import { UpcomingShifts } from "./UpcomingShifts";

function VendorDashboardPageContent() {
	const { ability, session } = useAuth();
	const dashboardQuery = useVendorDashboardQuery();
	const dashboard = dashboardQuery.data;
	const isVendorViewOnly =
		session.user.subRole === VendorUserRole.VENDOR_VIEW_ONLY;

	const quickActions = useMemo(() => {
		if (isVendorViewOnly) {
			return [];
		}
		return QUICK_ACTIONS.filter((action) => {
			if (action.href === "/vendor/invoices") {
				return ability.can(Action.List, "Invoice");
			}
			return true;
		});
	}, [ability, isVendorViewOnly]);

	const canViewFinancialOverview = ability.can(Action.List, "Invoice");

	const numberFormatter = useMemo(
		() =>
			new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
				maximumFractionDigits: 2,
			}),
		[],
	);

	const summaryStats = dashboard
		? [
				{
					title: "Active Candidates",
					value: String(dashboard.summary.activeCandidates),
					icon: Users,
					description:
						dashboard.summary.activeCandidatesDelta > 0
							? `+${dashboard.summary.activeCandidatesDelta} this week`
							: undefined,
					variant: "blue" as const,
				},
				{
					title: "Active Placements",
					value: String(dashboard.summary.activePlacements),
					icon: Briefcase,
					description:
						dashboard.summary.activePlacementsDelta > 0
							? `+${dashboard.summary.activePlacementsDelta} this month`
							: undefined,
					variant: "green" as const,
				},
				{
					title: "Pending Submissions",
					value: String(dashboard.summary.pendingSubmissions),
					icon: FileText,
					variant: "amber" as const,
				},
				{
					title: "Open Shifts",
					value: String(dashboard.summary.openShifts),
					icon: Clock,
					description:
						dashboard.summary.urgentOpenShifts > 0
							? `${dashboard.summary.urgentOpenShifts} urgent`
							: undefined,
					variant: "violet" as const,
				},
			]
		: [];

	const performanceStats = dashboard
		? [
				{
					title: "My Fill Rate",
					value: `${dashboard.performance.fillRate.toFixed(1)}%`,
					icon: Target,
					description: `${dashboard.performance.fillRateNumerator} hires / ${dashboard.performance.fillRateDenominator} submissions`,
					progress: dashboard.performance.fillRate,
					variant: "green" as const,
				},
				{
					title: "Submission-to-Hire Ratio",
					value:
						dashboard.performance.submissionToHireRatio == null
							? "N/A"
							: `1:${dashboard.performance.submissionToHireRatio.toFixed(1)}`,
					icon: TrendingUp,
					description: `${dashboard.performance.totalHires} hires from ${dashboard.performance.totalSubmissions} submissions`,
					variant: "blue" as const,
				},
				{
					title: "Placement Success",
					value: `${dashboard.performance.placementSuccessRate.toFixed(1)}%`,
					icon: Award,
					description: `${dashboard.performance.successfulPlacements} successful / ${dashboard.performance.totalPlacements} total placements`,
					progress: dashboard.performance.placementSuccessRate,
					variant: "violet" as const,
				},
			]
		: [];

	return (
		<div className="flex flex-col gap-10">
			<section className="flex flex-col gap-6">
				<ConfigPageHeader
					title="Vendor Dashboard"
					description="Overview of your staffing operations and performance metrics"
					total={0}
					itemLabel=""
					itemLabelPlural=""
				/>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{summaryStats.map((stat) => (
						<StatCard
							key={stat.title}
							title={stat.title}
							value={stat.value}
							icon={stat.icon}
							trendIcon={stat.description ? TrendingUp : undefined}
							description={
								stat.description ? (
									<span className="text-muted-foreground">
										{stat.description}
									</span>
								) : undefined
							}
							variant={stat.variant}
						/>
					))}
				</div>
			</section>

			<section className="flex flex-col gap-6">
				<PageSubheading
					title="My Agency Performance"
					subtitle="Your personal performance metrics and success rates"
				/>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{performanceStats.map((stat) => (
						<StatCard
							key={stat.title}
							title={stat.title}
							value={stat.value}
							icon={stat.icon}
							trendIcon={TrendingUp}
							description={<span>{stat.description}</span>}
							progress={stat.progress}
							variant={stat.variant}
						/>
					))}
				</div>
			</section>

			{canViewFinancialOverview && (
				<section className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FinancialOverview
						netInvoiceValue={numberFormatter.format(
							dashboard?.financial.netInvoiceValue ?? 0,
						)}
					/>
					<InvoiceStatus items={dashboard?.invoiceStatus ?? []} />
				</section>
			)}

			<section className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<ComplianceAlerts alerts={dashboard?.complianceAlerts ?? []} />
				<RecentActivity items={dashboard?.recentActivity ?? []} />
			</section>

			<OffersOverview
				allowOfferActions={!isVendorViewOnly}
				offers={dashboard?.offers ?? { overdue: [], pending: [] }}
			/>
			<UpcomingShifts
				allowClaim={!isVendorViewOnly}
				shifts={dashboard?.upcomingShifts ?? []}
			/>

			{quickActions.length > 0 ? (
				<section className="flex flex-col gap-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
						{quickActions.map((action, index) => (
							<QuickActionCard
								key={index}
								title={action.title}
								description={action.description}
								icon={action.icon}
								href={action.href}
							/>
						))}
					</div>
				</section>
			) : null}
		</div>
	);
}

export default VendorDashboardPageContent;
