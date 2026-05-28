"use client";

import { Button } from "@repo/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import type { LucideIcon } from "lucide-react";
import {
	AlertCircle,
	Briefcase,
	Calendar,
	FileText,
	Folder,
} from "lucide-react";
import { useCandidateDashboard } from "@/hooks/candidate/use-candidate-dashboard";
import { CandidateStatsCard } from "./CandidateStatsCard";
import { ComplianceSnapshot } from "./ComplianceSnapshot";
import { QuickActions } from "./QuickActions";
import { RecommendedJobs } from "./RecommendedJobs";
import { SubmissionReadyStatus } from "./SubmissionReadyStatus";

const DASHBOARD_MATCHES_LIMIT = 4;

function StatCardSkeleton() {
	return <Skeleton className="h-[118px] w-full rounded-lg" />;
}

type DashboardStatProps = {
	label: string;
	value: number;
	icon: LucideIcon;
	variant: "info" | "violet" | "success" | "warning" | "default";
	href: string;
	isLoading: boolean;
};

function DashboardStat({
	label,
	value,
	icon,
	variant,
	href,
	isLoading,
}: Readonly<DashboardStatProps>) {
	if (isLoading) {
		return <StatCardSkeleton />;
	}
	return (
		<CandidateStatsCard
			label={label}
			value={value}
			icon={icon}
			variant={variant}
			href={href}
		/>
	);
}

function CandidateDashboardPageContent() {
	const {
		profileQuery,
		organizationId,
		matchesQuery,
		statsQuery,
		placementCountsQuery,
		walletQuery,
		tier1Complete,
		tier1MissingItems,
		tier2Complete,
		tier3Complete,
	} = useCandidateDashboard(DASHBOARD_MATCHES_LIMIT);

	if (profileQuery.isPending) {
		return (
			<div className="space-y-4 sm:space-y-6">
				<div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<StatCardSkeleton key={i} />
					))}
				</div>
				<Skeleton className="h-72 w-full rounded-lg" />
				<Skeleton className="h-48 w-full rounded-lg" />
				<Skeleton className="h-40 w-full rounded-lg" />
			</div>
		);
	}

	if (profileQuery.isError) {
		return (
			<Empty>
				<EmptyHeader>
					<AlertCircle className="mx-auto size-8 text-destructive" />
					<EmptyTitle>Failed to load dashboard</EmptyTitle>
					<EmptyDescription>
						{profileQuery.error instanceof Error
							? profileQuery.error.message
							: "Something went wrong. Please try again."}
					</EmptyDescription>
				</EmptyHeader>
				<Button variant="outline" onClick={() => profileQuery.refetch()}>
					Try Again
				</Button>
			</Empty>
		);
	}

	const orgEnabled = Boolean(organizationId);
	const summary = walletQuery.data;
	const pendingDocuments =
		(summary?.pendingVerification ?? 0) + (summary?.pendingUpload ?? 0);

	return (
		<div className="space-y-4 sm:space-y-6">
			<div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<DashboardStat
					label="Open Jobs"
					value={matchesQuery.data?.total ?? 0}
					icon={Briefcase}
					variant="info"
					href="/matches"
					isLoading={orgEnabled && matchesQuery.isPending}
				/>
				<DashboardStat
					label="Applications"
					value={statsQuery.data?.["all-applications"] ?? 0}
					icon={FileText}
					variant="violet"
					href="/submissions"
					isLoading={orgEnabled && statsQuery.isPending}
				/>
				<DashboardStat
					label="Active Placements"
					value={placementCountsQuery.data?.active ?? 0}
					icon={Calendar}
					variant="success"
					href="/placements"
					isLoading={orgEnabled && placementCountsQuery.isPending}
				/>
				<DashboardStat
					label="Documents Pending"
					value={pendingDocuments}
					icon={Folder}
					variant="warning"
					href="/document-wallet"
					isLoading={orgEnabled && walletQuery.isPending}
				/>
			</div>

			<SubmissionReadyStatus
				tier1Complete={tier1Complete}
				tier1MissingItems={tier1MissingItems}
				tier2Complete={tier2Complete}
				tier3Complete={tier3Complete}
				walletLoading={orgEnabled && walletQuery.isPending}
				walletError={orgEnabled && walletQuery.isError}
				approvedPercent={
					summary && summary.total > 0 ? summary.approvedPercent : null
				}
				pendingUpload={summary?.pendingUpload ?? 0}
				pendingVerification={summary?.pendingVerification ?? 0}
				expired={summary?.expired ?? 0}
				totalRequirements={summary?.total ?? 0}
			/>

			<ComplianceSnapshot
				approved={summary?.approved ?? 0}
				pendingVerification={summary?.pendingVerification ?? 0}
				pendingUpload={summary?.pendingUpload ?? 0}
				expired={summary?.expired ?? 0}
				isLoading={orgEnabled && walletQuery.isPending}
				isError={orgEnabled && walletQuery.isError}
				onRetry={() => walletQuery.refetch()}
			/>

			<QuickActions />

			<RecommendedJobs
				jobs={matchesQuery.data?.items ?? []}
				isLoading={orgEnabled && matchesQuery.isPending}
				isError={orgEnabled && matchesQuery.isError}
				onRetry={() => matchesQuery.refetch()}
			/>
		</div>
	);
}

export default CandidateDashboardPageContent;
