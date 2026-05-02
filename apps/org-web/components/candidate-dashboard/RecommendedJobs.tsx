"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { CandidateMatchListItem } from "@/types/candidate-matches";
import {
	formatMatchFacilityLabel,
	formatMatchPayLabel,
	formatMatchShiftLabel,
} from "@/utils/candidate/match-display";
import { RecommendedJobItem } from "./RecommendedJobItem";

type RecommendedJobsProps = {
	jobs: CandidateMatchListItem[];
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
	page: number;
	totalPages: number;
	totalJobs: number;
	onPageChange: (page: number) => void;
};

export function RecommendedJobs({
	jobs,
	isLoading,
	isError,
	onRetry,
	page,
	totalPages,
	totalJobs,
	onPageChange,
}: RecommendedJobsProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0">
				<div>
					<CardTitle className="text-xl">Recommended Jobs</CardTitle>
					{!isLoading && !isError && totalJobs > 0 && (
						<p className="mt-1 text-sm text-muted-foreground">
							{totalJobs === 1 ? "1 job" : `${totalJobs} jobs`} — page {page} of{" "}
							{Math.max(1, totalPages)}
						</p>
					)}
				</div>
				<Button
					variant="link"
					asChild
					className="h-auto gap-1 p-0 text-muted-foreground hover:text-primary"
				>
					<Link href="/matches">
						View All
						<ChevronRight className="size-4" />
					</Link>
				</Button>
			</CardHeader>
			<CardContent className="space-y-4">
				{isLoading ? (
					<div className="space-y-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton key={i} className="h-40 w-full rounded-lg" />
						))}
					</div>
				) : isError ? (
					<ConfigPageErrorState
						title="Could not load jobs"
						description="Something went wrong. Please try again."
						action={
							<Button variant="outline" size="sm" onClick={onRetry}>
								Try again
							</Button>
						}
					/>
				) : jobs.length === 0 ? (
					<ConfigPageEmptyState
						hasSearch={false}
						emptyTitle="No matches yet"
						emptyMessage="Browse open roles to find positions that fit your profile."
						action={
							<Button asChild>
								<Link href="/matches">Browse jobs</Link>
							</Button>
						}
					/>
				) : (
					<>
						{jobs.map((job) => (
							<RecommendedJobItem
								key={job.id}
								title={job.jobTitle}
								facility={formatMatchFacilityLabel(job)}
								shift={formatMatchShiftLabel(job)}
								matchPercentage={job.matchPercentage}
								payRate={formatMatchPayLabel(job)}
								href={`/matches/${job.id}`}
							/>
						))}
						<ConfigPagePagination
							page={page}
							totalPages={totalPages}
							onPageChange={onPageChange}
						/>
					</>
				)}
			</CardContent>
		</Card>
	);
}
