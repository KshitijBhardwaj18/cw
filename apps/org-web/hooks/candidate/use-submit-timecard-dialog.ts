"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useUpsertCandidateTimecard } from "@/queries/candidate-placements.queries";
import type { CandidateTimecardDetail } from "@/types/candidate-timecard";
import type { TimeEntryRow } from "@/types/time-entry";
import { mapDetailEntriesToTimeEntryRows } from "@/utils/candidate-timecard-map";
import { createClientId } from "@/utils/create-client-id";
import {
	computeShiftHours,
	createEmptyWeekRows,
	getPayWeekRangeIso,
	getWeekDayLabelsForWeekEnding,
} from "@/utils/time-entry";

export interface UseSubmitTimecardDialogParams {
	/** False until candidate profile/org session is ready (guards mutations). */
	canMutate: boolean;
	placementId: string;
	weekEnding: string;
	initialDetail: CandidateTimecardDetail | undefined;
	isLoadingDetail: boolean;
	onOpenChange: (open: boolean) => void;
}

export function useSubmitTimecardDialog({
	canMutate,
	placementId,
	weekEnding,
	initialDetail,
	isLoadingDetail,
	onOpenChange,
}: UseSubmitTimecardDialogParams) {
	const weekLabels = useMemo(
		() => getWeekDayLabelsForWeekEnding(weekEnding),
		[weekEnding],
	);
	const weekRange = useMemo(() => getPayWeekRangeIso(weekEnding), [weekEnding]);

	const upsert = useUpsertCandidateTimecard(placementId);

	const [rows, setRows] = useState<TimeEntryRow[]>([]);
	const [notes, setNotes] = useState("");

	const resetForm = useCallback(() => {
		setRows(createEmptyWeekRows(weekLabels));
		setNotes("");
	}, [weekLabels]);

	useEffect(() => {
		if (initialDetail && initialDetail.weekEndingDate === weekEnding) {
			setRows(
				mapDetailEntriesToTimeEntryRows(initialDetail.entries, weekEnding),
			);
			setNotes(initialDetail.notes ?? "");
		} else {
			resetForm();
		}
	}, [weekEnding, initialDetail, resetForm]);

	const addOvertimeRow = useCallback(() => {
		setRows((prev) => [
			...prev,
			{
				id: `ot-${createClientId()}`,
				isOvertime: true,
				workDate: weekEnding,
				start: "",
				end: "",
				breakMin: "0",
			},
		]);
	}, [weekEnding]);

	const updateRow = useCallback((id: string, patch: Partial<TimeEntryRow>) => {
		setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
	}, []);

	const totalHours = useMemo(() => {
		return rows.reduce((sum, r) => {
			const br = Number.parseInt(r.breakMin, 10);
			const breakMin = Number.isNaN(br) ? 0 : br;
			return sum + computeShiftHours(r.start, r.end, breakMin);
		}, 0);
	}, [rows]);

	const buildPayload = useCallback(() => {
		return {
			weekEndingDate: weekEnding,
			notes: notes.trim() || undefined,
			entries: rows.map((r) => ({
				workDate: r.isOvertime
					? (r.workDate ?? weekEnding)
					: (r.weekLabel?.split(" ")[0] ?? weekEnding),
				isOvertime: r.isOvertime,
				start: r.start,
				end: r.end,
				breakMin: Number.parseInt(r.breakMin, 10) || 0,
				payCodeId: r.payCodeId || undefined,
			})),
		};
	}, [notes, rows, weekEnding]);

	const handleSaveDraft = useCallback(() => {
		if (!canMutate) return;
		upsert.mutate(
			{ ...buildPayload(), submit: false },
			{
				onSuccess: () => {
					toast.success("Draft saved");
					onOpenChange(false);
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Could not save draft",
					);
				},
			},
		);
	}, [buildPayload, canMutate, onOpenChange, upsert]);

	const handleSubmit = useCallback(() => {
		if (!canMutate) return;
		if (totalHours <= 0) {
			toast.error("Enter at least one shift with hours before submitting");
			return;
		}
		upsert.mutate(
			{ ...buildPayload(), submit: true },
			{
				onSuccess: () => {
					toast.success("Timecard submitted");
					onOpenChange(false);
					resetForm();
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Could not submit timecard",
					);
				},
			},
		);
	}, [buildPayload, canMutate, onOpenChange, resetForm, totalHours, upsert]);

	return {
		weekRange,
		rows,
		notes,
		setNotes,
		addOvertimeRow,
		updateRow,
		totalHours,
		handleSaveDraft,
		handleSubmit,
		isSaving: upsert.isPending,
		isLoadingDetail,
	};
}
