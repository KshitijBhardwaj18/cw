"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { useCallback, useState } from "react";
import { SubmitTimecardDialog } from "@/components/candidate-placements/SubmitTimecardDialog";
import { TimecardCurrentAssignmentCard } from "@/components/candidate-placements/TimecardCurrentAssignmentCard";
import { TimecardHistoryRow } from "@/components/candidate-placements/TimecardHistoryRow";
import { useCandidateTimecardDetail } from "@/queries/candidate-placements.queries";
import type { CandidateTimecardPageData } from "@/types/candidate-timecard";

export interface TimecardPageContentProps {
	data: CandidateTimecardPageData;
	canMutate: boolean;
}

export function TimecardPageContent({
	data,
	canMutate,
}: TimecardPageContentProps) {
	const [entryOpen, setEntryOpen] = useState(false);
	const [dialogWeekEnding, setDialogWeekEnding] = useState(
		data.currentWeekEnding,
	);
	const [dialogTimesheetId, setDialogTimesheetId] = useState<string | null>(
		null,
	);

	const detailQuery = useCandidateTimecardDetail(
		data.placementId,
		dialogTimesheetId,
		entryOpen && dialogTimesheetId != null,
	);

	const openEntryForWeek = useCallback(
		(weekEnding: string, timesheetId?: string | null) => {
			setDialogWeekEnding(weekEnding);
			setDialogTimesheetId(timesheetId ?? null);
			setEntryOpen(true);
		},
		[],
	);

	const openEntryForCurrentWeek = useCallback(() => {
		const draftForWeek = data.timecards.find(
			(t) =>
				t.weekEndingDate === data.currentWeekEnding && t.status === "draft",
		);
		openEntryForWeek(data.currentWeekEnding, draftForWeek?.id ?? null);
	}, [data.currentWeekEnding, data.timecards, openEntryForWeek]);

	return (
		<div className="space-y-8">
			<SubmitTimecardDialog
				open={entryOpen}
				onOpenChange={(open) => {
					setEntryOpen(open);
					if (!open) setDialogTimesheetId(null);
				}}
				assignmentTitle={data.assignmentTitle}
				weekEnding={dialogWeekEnding}
				placementId={data.placementId}
				canMutate={canMutate}
				initialDetail={detailQuery.data}
				isLoadingDetail={Boolean(dialogTimesheetId) && detailQuery.isPending}
				payCodeOptions={data.payCodes}
			/>

			<TimecardCurrentAssignmentCard
				assignmentTitle={data.assignmentTitle}
				currentWeekEnding={data.currentWeekEnding}
				onEnterTime={openEntryForCurrentWeek}
			/>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg font-semibold">
						Timecard History
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 pt-0">
					{data.timecards.map((item) => (
						<TimecardHistoryRow
							key={item.id}
							item={item}
							placementId={data.placementId}
							onContinueEntry={openEntryForWeek}
						/>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
