"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
	ArrowRight,
	Bookmark,
	BookmarkCheck,
	Check,
	CheckCircle2,
	Clock,
	DollarSign,
	MapPin,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
	getContractTypeLabel,
	getShiftTypeLabel,
} from "@/constants/candidate/matches-and-job-search";
import {
	useSaveMatch,
	useUnsaveMatch,
} from "@/queries/candidate-matches.queries";
import type { CandidateMatchListItem } from "@/types/candidate-matches";
import {
	formatMatchFacilityLabel,
	formatMatchPayLabel,
} from "@/utils/candidate/match-display";

export interface CandidateJobMatchCardProps {
	job: CandidateMatchListItem;
	organizationId: string | null;
}

export function CandidateJobMatchCard({
	job,
	organizationId,
}: CandidateJobMatchCardProps) {
	const saveMatch = useSaveMatch();
	const unsaveMatch = useUnsaveMatch();

	const isSaving = saveMatch.isPending || unsaveMatch.isPending;

	const handleToggleSave = () => {
		if (!organizationId) return;
		if (job.isSaved) {
			unsaveMatch.mutate(job.id, {
				onSuccess: () => toast.success("Job removed from saved"),
				onError: (e) =>
					toast.error(e instanceof Error ? e.message : "Failed to unsave job"),
			});
		} else {
			saveMatch.mutate(job.id, {
				onSuccess: () => toast.success("Job saved"),
				onError: (e) =>
					toast.error(e instanceof Error ? e.message : "Failed to save job"),
			});
		}
	};

	const locationLine = formatMatchFacilityLabel(job);
	const payLabel = formatMatchPayLabel(job);
	const hasPay = payLabel !== "—";

	return (
		<Card className="flex h-full flex-col overflow-hidden border py-1 shadow-sm transition-shadow hover:shadow-md">
			<CardContent className="flex flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div className="flex flex-wrap gap-1.5">
						<Badge
							variant="success"
							className="gap-1 font-medium [&>svg]:size-3.5"
						>
							<Check className="size-3.5" aria-hidden />
							{job.matchPercentage}% Match
						</Badge>
						{job.isApplied && (
							<Badge
								variant="outline"
								className="gap-1 border-blue-300 bg-blue-50 text-blue-700 font-medium dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
							>
								<CheckCircle2 className="size-3.5" aria-hidden />
								Applied
							</Badge>
						)}
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
						onClick={handleToggleSave}
						disabled={isSaving || !organizationId}
						aria-label={job.isSaved ? "Remove from saved" : "Save job"}
					>
						{job.isSaved ? (
							<BookmarkCheck className="size-4 text-primary" />
						) : (
							<Bookmark className="size-4" />
						)}
					</Button>
				</div>

				<div>
					<h3 className="text-base font-semibold leading-snug text-foreground">
						{job.jobTitle}
					</h3>
					{job.specialty && (
						<p className="mt-0.5 text-sm text-muted-foreground">
							{job.specialty}
						</p>
					)}
				</div>

				<div className="space-y-2 text-sm">
					{(job.facilityName || (job.locationCity && job.locationState)) && (
						<div className="flex min-w-0 items-start gap-2">
							<MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<span className="leading-snug text-muted-foreground">
								<span className="text-foreground">{locationLine}</span>
							</span>
						</div>
					)}
					{job.shiftType && (
						<div className="flex min-w-0 items-center gap-2">
							<Clock className="size-4 shrink-0 text-muted-foreground" />
							<span className="text-muted-foreground">
								{getShiftTypeLabel(job.shiftType)}
								{job.shiftHours ? ` (${job.shiftHours})` : ""}
							</span>
						</div>
					)}
				</div>

				{hasPay && (
					<div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
						<DollarSign className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
						<span className="text-sm font-medium">{payLabel}</span>
					</div>
				)}

				<div className="flex flex-wrap gap-2">
					<Badge variant="info" className="font-normal">
						{getContractTypeLabel(job.contractType)}
					</Badge>
					{job.department && (
						<Badge variant="secondary" className="font-normal">
							{job.department}
						</Badge>
					)}
				</div>

				<div className="mt-auto pt-1">
					<Button asChild className="w-full gap-2 font-medium">
						<Link href={`/matches/${job.id}`}>
							View Details
							<ArrowRight className="size-4" aria-hidden />
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
