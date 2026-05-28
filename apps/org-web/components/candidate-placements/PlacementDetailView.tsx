"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { PageBackLink } from "@repo/ui/general/PageBackLink";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { cn } from "@repo/ui/lib/utils";
import { Calendar, Clock, FileClock, MapPin } from "lucide-react";
import Link from "next/link";
import { CANDIDATE_PORTAL_COPY } from "@/constants/candidate-portal";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { CandidatePlacementDetail } from "@/types/candidate-placement-detail";
import {
	candidatePlacementsListPath,
	candidatePlacementTimecardPath,
} from "@/utils/candidate-portal-routes";
import { PlacementDetailComplianceTab } from "./placement-detail/PlacementDetailComplianceTab";
import { PlacementDetailOfferHistoryTab } from "./placement-detail/PlacementDetailOfferHistoryTab";
import { PlacementDetailOverviewTab } from "./placement-detail/PlacementDetailOverviewTab";

export interface PlacementDetailViewProps {
	detail: CandidatePlacementDetail;
	placementId: string;
}

const STATUS_BADGE_CLASS: Record<CandidatePlacementDetail["kind"], string> = {
	active:
		"bg-emerald-100 text-emerald-800 hover:bg-emerald-100/90 dark:bg-emerald-950/40 dark:text-emerald-200",
	upcoming:
		"bg-sky-100 text-sky-800 hover:bg-sky-100/90 dark:bg-sky-950/40 dark:text-sky-200",
	past: "bg-slate-100 text-slate-700 hover:bg-slate-100/90 dark:bg-slate-800 dark:text-slate-200",
};

export function PlacementDetailView({
	detail,
	placementId,
}: Readonly<PlacementDetailViewProps>) {
	const badgeClass = STATUS_BADGE_CLASS[detail.kind];
	const timecardHref = candidatePlacementTimecardPath(placementId);
	const { fmtShortDate, fmtDateRange } = useUserTimezone();

	const assignmentDateRange =
		fmtDateRange(detail.summary.startDate, detail.summary.endDate) ||
		detail.dateRangeLabel;

	return (
		<div className="space-y-6">
			<PageBackLink href={candidatePlacementsListPath()}>
				{CANDIDATE_PORTAL_COPY.backToPlacements}
			</PageBackLink>

			<Card>
				<CardHeader className="border-b">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
						<div className="min-w-0 flex-1">
							<CardTitle className="text-lg font-semibold sm:text-xl">
								{detail.jobTitle}
							</CardTitle>
							<CardDescription className="mt-1 text-base wrap-break-word">
								{detail.facilityName}
							</CardDescription>
						</div>
						{detail.kind !== "upcoming" && (
							<Button
								size="sm"
								variant="outline"
								className="shrink-0 self-start"
								asChild
							>
								<Link href={timecardHref}>
									<FileClock className="size-4" />
									View Timecards
								</Link>
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="text-muted-foreground flex flex-wrap gap-x-8 gap-y-3 text-sm">
						<span className="inline-flex items-center gap-1.5">
							<MapPin className="size-4 shrink-0 opacity-80" aria-hidden />
							{detail.locationLabel}
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Clock className="size-4 shrink-0 opacity-80" aria-hidden />
							{detail.shiftLabel}
						</span>
						<span className="inline-flex items-center gap-1.5">
							<Calendar className="size-4 shrink-0 opacity-80" aria-hidden />
							{assignmentDateRange}
						</span>
					</div>
					<div className="bg-muted/60 rounded-lg px-4 py-4 sm:px-6">
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
							<DetailItem
								label="Start Date"
								value={fmtShortDate(detail.summary.startDate)}
							/>
							<DetailItem
								label="End Date"
								value={fmtShortDate(detail.summary.endDate)}
							/>
							<DetailItem label="Pay Rate" value={detail.summary.payRate} />
							<DetailItem
								label="Status"
								value={
									<Badge
										variant="secondary"
										className={cn("w-fit text-xs font-medium", badgeClass)}
									>
										{detail.statusLabel}
									</Badge>
								}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<Tabs defaultValue="overview" className="flex-col gap-6">
						<ScrollableLineTabsRow>
							<TabsList
								variant="line"
								className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-6 rounded-none border-0 bg-transparent p-0"
							>
								<TabsTrigger value="overview" className="flex-none pb-3">
									Overview
								</TabsTrigger>
								<TabsTrigger value="compliance" className="flex-none pb-3">
									Compliance
								</TabsTrigger>
								<TabsTrigger value="offer-history" className="flex-none pb-3">
									Offer History
								</TabsTrigger>
							</TabsList>
						</ScrollableLineTabsRow>

						<TabsContent value="overview" className="mt-0">
							<PlacementDetailOverviewTab detail={detail} />
						</TabsContent>

						<TabsContent value="compliance" className="mt-0">
							<PlacementDetailComplianceTab placementId={placementId} />
						</TabsContent>

						<TabsContent value="offer-history" className="mt-0">
							<PlacementDetailOfferHistoryTab placementId={placementId} />
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
