"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ActionBar } from "@repo/ui/general/ActionBar";
import {
	AlertCircle,
	ArrowRight,
	Bookmark,
	CheckCircle2,
	ChevronRight,
	Clock3,
	MapPin,
} from "lucide-react";
import Link from "next/link";
import { useCandidateSavedJobs } from "@/queries/candidate-matches.queries";

type SavedJobsCardProps = {
	organizationId: string | null;
};

export function SavedJobsCard({ organizationId }: SavedJobsCardProps) {
	const savedJobsQuery = useCandidateSavedJobs(3, {
		enabled: !!organizationId,
	});

	const isLoading = savedJobsQuery.isPending && !!organizationId;
	const jobs = savedJobsQuery.data?.items ?? [];
	const hasJobs = jobs.length > 0;

	if (isLoading) {
		return (
			<Card className="h-full">
				<CardHeader className="flex items-center justify-between">
					<CardTitle className="text-xl">Saved Jobs</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{Array.from({ length: 2 }).map((_, i) => (
						<Skeleton key={i} className="h-16 w-full rounded-lg" />
					))}
				</CardContent>
			</Card>
		);
	}

	if (savedJobsQuery.isError) {
		return (
			<Card className="h-full">
				<CardHeader className="flex items-center justify-between">
					<CardTitle className="text-xl">Saved Jobs</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
						<AlertCircle className="size-4 shrink-0" />
						<span>Could not load saved jobs.</span>
						<Button
							variant="ghost"
							size="sm"
							className="ml-auto h-auto p-0 text-destructive underline-offset-2 hover:underline"
							onClick={() => savedJobsQuery.refetch()}
						>
							Retry
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-full">
			<CardHeader className="flex items-center justify-between">
				<CardTitle className="text-xl">Saved Jobs</CardTitle>
				{hasJobs ? (
					<Button variant="link" className="gap-1 text-foreground" asChild>
						<Link href="/matches">
							View All <ChevronRight className="size-4" />
						</Link>
					</Button>
				) : (
					<Badge variant="info">
						<Bookmark className="size-3" />0 Saved
					</Badge>
				)}
			</CardHeader>
			<CardContent>
				{hasJobs ? (
					<div className="space-y-4">
						{jobs.map((job) => (
							<ActionBar
								key={job.id}
								type="link"
								href={`/matches/${job.id}`}
								className="p-3"
								innerClassName="flex-col items-start text-sm"
							>
								<div className="flex items-center gap-3 flex-wrap">
									<h3 className="font-medium">{job.jobTitle}</h3>
									<Badge variant="success">
										<CheckCircle2 className="size-3" />
										{job.matchPercentage}% Match
									</Badge>
								</div>

								<div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground mt-1.5">
									{job.facilityName && (
										<div className="flex items-center gap-1.5">
											<MapPin className="size-4" />
											<span>{job.facilityName}</span>
										</div>
									)}
									{job.shiftType && (
										<div className="flex items-center gap-1.5">
											<Clock3 className="size-4" />
											<span>{job.shiftType}</span>
										</div>
									)}
								</div>
							</ActionBar>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-10 text-center">
						<div className="mb-4 flex size-12 items-center justify-center rounded bg-muted/10 text-muted-foreground/40">
							<Bookmark className="size-8" />
						</div>
						<h3 className="font-semibold text-lg">No saved jobs yet</h3>
						<p className="mt-1 text-muted-foreground text-sm">
							{organizationId
								? "Save jobs you're interested in to review them later"
								: "Complete your profile to start browsing jobs"}
						</p>
						<Button className="mt-6 gap-2" asChild>
							<Link href="/matches">
								Browse Jobs <ArrowRight className="size-4" />
							</Link>
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
