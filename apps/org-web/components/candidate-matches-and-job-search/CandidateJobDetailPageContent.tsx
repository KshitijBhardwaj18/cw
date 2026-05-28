"use client";

import { formatUsdPerHour, formatUsdWhole } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import { cn } from "@repo/ui/lib/utils";
import {
	ArrowRight,
	Bookmark,
	BookmarkCheck,
	Calendar,
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
import { useUserTimezone } from "@/hooks/use-user-timezone";
import {
	useSaveMatch,
	useUnsaveMatch,
} from "@/queries/candidate-matches.queries";
import type { CandidateMatchDetail } from "@/types/candidate-matches";
import { formatMatchSpecialtyLabel } from "@/utils/candidate/match-display";

export interface CandidateJobDetailPageContentProps {
	job: CandidateMatchDetail;
	organizationId: string | null;
}

function DetailGrid({
	items,
	columnsClassName = "md:grid-cols-2",
}: Readonly<{
	items: readonly { label: string; value: string }[];
	columnsClassName?: string;
}>) {
	return (
		<div className={cn("grid gap-6", columnsClassName)}>
			{items.map((row) => (
				<DetailItem key={row.label} label={row.label} value={row.value} />
			))}
		</div>
	);
}

export function CandidateJobDetailPageContent({
	job,
	organizationId,
}: Readonly<CandidateJobDetailPageContentProps>) {
	const { fmtShortDate } = useUserTimezone();
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
	const location =
		job.locationCity && job.locationState
			? `${job.locationCity}, ${job.locationState}`
			: null;

	const locationLine = [job.facilityName, location].filter(Boolean).join(" · ");
	const specialtyLabel = formatMatchSpecialtyLabel(job);

	const incentiveLabel =
		job.incentiveType && job.incentiveAmount != null
			? `${job.incentiveType}: ${formatUsdWhole(job.incentiveAmount)}`
			: job.billRate != null
				? formatUsdPerHour(job.billRate)
				: null;

	const schedulePayRows = [
		job.shiftType && {
			label: "Shift",
			value: `${getShiftTypeLabel(job.shiftType)}${job.shiftHours ? ` (${job.shiftHours})` : ""}`,
		},
		job.lengthWeeks && {
			label: "Duration",
			value: `${job.lengthWeeks} weeks`,
		},
		{
			label: "Contract Type",
			value: getContractTypeLabel(job.contractType),
		},
		job.hoursPerWeek && {
			label: "Hours / Week",
			value: `${job.hoursPerWeek}h`,
		},
	].filter(Boolean) as { label: string; value: string }[];

	const placementDetailRows = [
		{
			label: "Contract Type",
			value: getContractTypeLabel(job.contractType),
		},
		{
			label: "Open Positions",
			value: `${job.numberOfPositions - job.positionsFilled} of ${job.numberOfPositions}`,
		},
		job.shiftHours && { label: "Shift Hours", value: job.shiftHours },
		job.startDate && {
			label: "Start Date",
			value: fmtShortDate(job.startDate),
		},
		job.shiftsPerWeek && {
			label: "Shifts / Week",
			value: String(job.shiftsPerWeek),
		},
		job.interviewRequired && {
			label: "Interview",
			value: job.interviewRequired,
		},
	].filter(Boolean) as { label: string; value: string }[];

	const unmatchedCriteria = job.matchBreakdown.filter((b) => !b.matched);

	return (
		<div className="space-y-6">
			<PageBackLink href="/matches">Back to Jobs &amp; Matches</PageBackLink>

			<Card className="overflow-hidden">
				<CardHeader className="border-b pb-6">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<CardTitle className="min-w-0 text-xl font-semibold leading-tight sm:text-2xl">
							{job.jobTitle}
						</CardTitle>
						<Badge
							variant="success"
							className="gap-1 font-medium [&>svg]:size-3.5"
						>
							<Check className="size-3.5" aria-hidden />
							{job.matchPercentage}% Match
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex flex-wrap gap-x-8 gap-y-3 text-muted-foreground text-sm">
						{locationLine && (
							<span className="inline-flex items-center gap-2">
								<MapPin className="size-4 shrink-0" aria-hidden />
								<span className="font-medium text-foreground">
									{locationLine}
								</span>
							</span>
						)}
						{job.shiftType && (
							<span className="inline-flex items-center gap-2">
								<Clock className="size-4 shrink-0" aria-hidden />
								{getShiftTypeLabel(job.shiftType)}
								{job.shiftHours ? ` (${job.shiftHours})` : ""}
							</span>
						)}
						{job.lengthWeeks && (
							<span className="inline-flex items-center gap-2">
								<Calendar className="size-4 shrink-0" aria-hidden />
								{job.lengthWeeks} weeks
							</span>
						)}
					</div>

					<div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/60 p-4 md:grid-cols-3">
						{job.unitName && <DetailItem label="Unit" value={job.unitName} />}
						{specialtyLabel && (
							<DetailItem label="Specialty" value={specialtyLabel} />
						)}
						{job.startDate && (
							<DetailItem
								label="Start Date"
								value={fmtShortDate(job.startDate)}
							/>
						)}
					</div>

					{incentiveLabel && (
						<div className="flex flex-wrap items-center gap-2">
							<div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
								<DollarSign className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
								<span className="text-sm font-medium capitalize">
									{incentiveLabel}
								</span>
							</div>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex flex-col items-stretch gap-3 border-t">
					<div className="flex flex-col gap-3 sm:flex-row">
						{job.isApplied ? (
							<Button
								variant="outline"
								className="gap-2 font-medium border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700 sm:min-w-[160px] dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
								disabled
							>
								<CheckCircle2 className="size-4" aria-hidden />
								Applied
							</Button>
						) : job.isSubmittedForVendorReview ? (
							<Button
								variant="outline"
								className="gap-2 font-medium border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700 sm:min-w-[160px] dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
								disabled
							>
								<CheckCircle2 className="size-4" aria-hidden />
								Marked as interested
							</Button>
						) : (
							<Button className="gap-2 font-medium sm:min-w-[160px]" asChild>
								<Link href={`/matches/${job.id}/apply`}>
									Apply Now
									<ArrowRight className="size-4" aria-hidden />
								</Link>
							</Button>
						)}
						<Button
							type="button"
							variant="outline"
							className="gap-2 font-medium sm:min-w-[160px]"
							onClick={handleToggleSave}
							disabled={isSaving || !organizationId}
						>
							{job.isSaved ? (
								<>
									<BookmarkCheck className="size-4 text-primary" aria-hidden />
									Saved
								</>
							) : (
								<>
									<Bookmark className="size-4" aria-hidden />
									Save Job
								</>
							)}
						</Button>
					</div>
				</CardFooter>
			</Card>

			{job.matchBreakdown.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Match Breakdown</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<p className="text-sm text-muted-foreground">
							Your profile was scored against the following criteria:
						</p>
						<ul className="divide-y rounded-lg border">
							{job.matchBreakdown.map((item) => (
								<li
									key={item.criterionName}
									className="flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4"
								>
									<span className="min-w-0 font-medium">
										{item.criterionName}
									</span>
									<div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:justify-end">
										<span className="text-muted-foreground text-xs sm:text-sm">
											{item.weight}% weight
										</span>
										{item.matched ? (
											<Badge variant="success" className="gap-1 shrink-0">
												<Check className="size-3" aria-hidden />
												Matched
											</Badge>
										) : (
											<Badge variant="secondary" className="shrink-0">
												Not matched
											</Badge>
										)}
									</div>
								</li>
							))}
						</ul>
						{unmatchedCriteria.length > 0 && (
							<p className="text-sm text-muted-foreground">
								Update your profile preferences to improve your match score on{" "}
								{unmatchedCriteria.map((c) => c.criterionName).join(", ")}.
							</p>
						)}
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Facility Information</CardTitle>
				</CardHeader>
				<CardContent>
					<DetailGrid
						items={[
							{ label: "Location", value: locationLine || "—" },
							{ label: "Department", value: job.department ?? "—" },
							{ label: "Occupation", value: job.occupation ?? "—" },
							{ label: "Specialty", value: specialtyLabel ?? "—" },
						]}
					/>
				</CardContent>
			</Card>

			{job.jobSummary && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Job Overview</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm leading-relaxed">
						<p>{job.jobSummary}</p>
					</CardContent>
				</Card>
			)}

			{schedulePayRows.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Schedule &amp; Pay</CardTitle>
					</CardHeader>
					<CardContent>
						<DetailGrid
							items={schedulePayRows}
							columnsClassName="md:grid-cols-2"
						/>
					</CardContent>
				</Card>
			)}

			{placementDetailRows.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Placement Details</CardTitle>
					</CardHeader>
					<CardContent>
						<DetailGrid items={placementDetailRows} />
					</CardContent>
				</Card>
			)}

			{job.vendorNotes && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Additional Notes</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm leading-relaxed text-muted-foreground">
							{job.vendorNotes}
						</p>
					</CardContent>
				</Card>
			)}

			{job.benefitsPerks.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Benefits &amp; Perks</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="list-inside list-disc space-y-2 text-sm marker:text-primary">
							{job.benefitsPerks.map((perk) => (
								<li key={perk}>{perk}</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}

			{job.acceptanceCriteria.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Required Documents</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="divide-y rounded-lg border">
							{job.acceptanceCriteria.map((doc) => (
								<li
									key={doc.id}
									className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
								>
									<span className="min-w-0 font-medium">{doc.name}</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
