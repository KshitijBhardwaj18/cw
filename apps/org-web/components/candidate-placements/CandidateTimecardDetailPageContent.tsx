"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { useMemo, useState } from "react";
import { CandidatePortalContentSkeleton } from "@/components/candidate-placements/CandidatePortalContentSkeleton";
import { SubmitTimecardDialog } from "@/components/candidate-placements/SubmitTimecardDialog";
import { CANDIDATE_PORTAL_COPY } from "@/constants/candidate-portal";
import { useCandidateTimecardDetailPage } from "@/hooks/candidate/use-candidate-timecard-detail-page";
import { sumTimecardEntryHours } from "@/utils/candidate-timecard-aggregate";

export function CandidateTimecardDetailPageContent({
	placementId,
	timecardId,
}: {
	placementId: string;
	timecardId: string;
}) {
	const { organizationId, orgLoading, isReady, detailQuery } =
		useCandidateTimecardDetailPage(placementId, timecardId);
	const [editOpen, setEditOpen] = useState(false);

	const totalHours = useMemo(() => {
		const entries = detailQuery.data?.entries;
		if (!entries?.length) return 0;
		return sumTimecardEntryHours(entries);
	}, [detailQuery.data?.entries]);

	if (orgLoading || (organizationId && !isReady)) {
		return <CandidatePortalContentSkeleton variant="compact" />;
	}

	if (!organizationId) {
		return (
			<p className="text-muted-foreground text-sm">
				{CANDIDATE_PORTAL_COPY.needOrganization}
			</p>
		);
	}

	if (detailQuery.isPending) {
		return <CandidatePortalContentSkeleton variant="compact" />;
	}

	if (detailQuery.isError || !detailQuery.data) {
		return (
			<p className="text-destructive text-sm">
				{detailQuery.error instanceof Error
					? detailQuery.error.message
					: CANDIDATE_PORTAL_COPY.couldNotLoadTimecard}
			</p>
		);
	}

	const d = detailQuery.data;

	return (
		<div className="space-y-6">
			{d.canEdit ? (
				<SubmitTimecardDialog
					open={editOpen}
					onOpenChange={setEditOpen}
					assignmentTitle={d.assignmentTitle}
					weekEnding={d.weekEndingDate}
					placementId={placementId}
					canMutate={Boolean(organizationId)}
					initialDetail={d}
					isLoadingDetail={false}
					payCodeOptions={d.payCodes}
				/>
			) : null}

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">
						{d.assignmentTitle}
					</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						Week ending {d.weekEndingDate} · {totalHours} hours
					</p>
				</div>
				{d.canEdit ? (
					<Button type="button" onClick={() => setEditOpen(true)}>
						Edit timecard
					</Button>
				) : null}
			</div>

			{d.notes ? (
				<Card className="shadow-none">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Notes</CardTitle>
					</CardHeader>
					<CardContent className="text-muted-foreground text-sm whitespace-pre-wrap">
						{d.notes}
					</CardContent>
				</Card>
			) : null}

			<Card className="shadow-none">
				<CardHeader>
					<CardTitle className="text-base">Entries</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto pt-0">
					{d.entries.length === 0 ? (
						<p className="text-muted-foreground text-sm">No shift rows yet.</p>
					) : (
						<table className="w-full min-w-[36rem] text-sm">
							<thead>
								<tr className="border-b text-left">
									<th className="pb-2 pr-3 font-medium">Date</th>
									<th className="pb-2 pr-3 font-medium">In</th>
									<th className="pb-2 pr-3 font-medium">Out</th>
									<th className="pb-2 pr-3 font-medium">Break (min)</th>
									<th className="pb-2 pr-3 font-medium">Regular</th>
									<th className="pb-2 font-medium">OT</th>
								</tr>
							</thead>
							<tbody>
								{d.entries.map((e) => (
									<tr key={e.id} className="border-b border-border/60">
										<td className="py-2 pr-3 font-mono tabular-nums">
											{e.workDate}
										</td>
										<td className="py-2 pr-3">{e.clockIn ?? "—"}</td>
										<td className="py-2 pr-3">{e.clockOut ?? "—"}</td>
										<td className="py-2 pr-3">{e.breakMinutes}</td>
										<td className="py-2 pr-3 tabular-nums">{e.regularHours}</td>
										<td className="py-2 tabular-nums">{e.overtimeHours}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
