"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useSubmitShiftTimecard } from "@/queries/candidate-shifts.queries";
import { useVendorSubmitAssignmentTimecard } from "@/queries/vendor-shift-claiming.queries";
import type { CandidateShiftListItem } from "@/types/candidate-shifts";
import type { TimeEntryRow } from "@/types/time-entry";
import { createClientId } from "@/utils/create-client-id";
import { computeShiftHours, normalizeTimeForInput } from "@/utils/time-entry";

function buildInitialRows(shift: CandidateShiftListItem): TimeEntryRow[] {
	if (shift.savedTimecardSegments && shift.savedTimecardSegments.length > 0) {
		return shift.savedTimecardSegments.map((seg, idx) => ({
			id: seg.isOvertime ? `ot-${idx}` : "regular",
			isOvertime: seg.isOvertime,
			weekLabel: shift.date,
			workDate: seg.workDate,
			start: normalizeTimeForInput(seg.start),
			end: normalizeTimeForInput(seg.end),
			breakMin: String(seg.breakMin),
		}));
	}

	const hasSaved =
		Boolean(shift.savedActualStartTime) && Boolean(shift.savedActualEndTime);
	const start = hasSaved ? String(shift.savedActualStartTime) : shift.startTime;
	const end = hasSaved ? String(shift.savedActualEndTime) : shift.endTime;
	const breakMin =
		shift.savedBreakMinutes != null ? String(shift.savedBreakMinutes) : "30";

	return [
		{
			id: "regular",
			isOvertime: false,
			weekLabel: shift.date,
			start,
			end,
			breakMin,
		},
	];
}

export interface UseSubmitShiftTimecardDialogProps {
	mode?: "candidate" | "vendor";
	vendorAssignmentId?: string;
	shift: CandidateShiftListItem | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export function useSubmitShiftTimecardDialog({
	mode = "candidate",
	vendorAssignmentId,
	shift,
	isOpen,
	onOpenChange,
}: UseSubmitShiftTimecardDialogProps) {
	const [rows, setRows] = useState<TimeEntryRow[]>(() =>
		shift ? buildInitialRows(shift) : [],
	);
	const [notes, setNotes] = useState(shift?.timecardNotes ?? "");

	const candidateMutation = useSubmitShiftTimecard();
	const vendorMutation = useVendorSubmitAssignmentTimecard();

	const wasOpenRef = useRef(false);
	const lastShiftIdRef = useRef<string | undefined>(undefined);

	useEffect(() => {
		if (!isOpen) {
			wasOpenRef.current = false;
			return;
		}
		if (!shift) return;

		const justOpened = !wasOpenRef.current;
		wasOpenRef.current = true;
		const shiftChanged = lastShiftIdRef.current !== shift.id;
		if (shiftChanged) lastShiftIdRef.current = shift.id;

		if (justOpened || shiftChanged) {
			setRows(buildInitialRows(shift));
			setNotes(shift.timecardNotes ?? "");
		}
	}, [isOpen, shift]);

	const updateRow = useCallback((id: string, patch: Partial<TimeEntryRow>) => {
		setRows((prev) =>
			prev.map((r) => {
				if (r.id !== id) return r;
				const merged: TimeEntryRow = { ...r, ...patch };
				if (patch.start !== undefined) {
					merged.start = normalizeTimeForInput(patch.start);
				}
				if (patch.end !== undefined) {
					merged.end = normalizeTimeForInput(patch.end);
				}
				return merged;
			}),
		);
	}, []);

	const addOvertimeRow = useCallback(() => {
		if (!shift) return;
		setRows((prev) => [
			...prev,
			{
				id: `ot-${createClientId()}`,
				isOvertime: true,
				workDate: shift.date,
				start: "",
				end: "",
				breakMin: "0",
			},
		]);
	}, [shift]);

	const removeRow = useCallback((id: string) => {
		setRows((prev) => prev.filter((r) => r.id !== id));
	}, []);

	const totalHours = useMemo(() => {
		return rows.reduce((sum, r) => {
			const br = Number.parseInt(r.breakMin, 10);
			const breakMin = Number.isNaN(br) ? 0 : br;
			return sum + computeShiftHours(r.start, r.end, breakMin);
		}, 0);
	}, [rows]);

	const estimatedPay = shift ? shift.ratePerHour * totalHours : 0;

	const regularRow = rows.find((r) => !r.isOvertime);

	const buildPayload = (submit: boolean) => {
		if (!shift) {
			return { entries: [], submit };
		}
		return {
			entries: rows.map((r) => ({
				workDate: (r.workDate ?? shift.date).trim(),
				isOvertime: r.isOvertime,
				start: r.start,
				end: r.end,
				breakMin: Number.parseInt(r.breakMin, 10) || 0,
			})),
			notes: notes.trim() || undefined,
			submit,
		};
	};

	const handleSaveDraft = () => {
		if (!shift) return;
		if (mode === "vendor") {
			if (!vendorAssignmentId) {
				toast.error("Missing assignment for this shift");
				return;
			}
			vendorMutation.mutate(
				{
					assignmentId: vendorAssignmentId,
					payload: buildPayload(false),
				},
				{
					onSuccess: () => {
						toast.success("Draft saved");
						onOpenChange(false);
					},
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Failed to save draft",
						),
				},
			);
			return;
		}
		candidateMutation.mutate(
			{ shiftId: shift.id, payload: buildPayload(false) },
			{
				onSuccess: () => {
					toast.success("Draft saved");
					onOpenChange(false);
				},
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to save draft",
					),
			},
		);
	};

	const handleSubmit = () => {
		if (!shift) return;
		if (!regularRow?.start || !regularRow?.end) {
			toast.error("Please enter actual start and end times");
			return;
		}
		const incompleteOvertime = rows.some(
			(r) =>
				r.isOvertime &&
				Boolean(r.start.trim() || r.end.trim()) &&
				!(r.start.trim() && r.end.trim()),
		);
		if (incompleteOvertime) {
			toast.error("Enter both start and end times for each overtime row");
			return;
		}
		if (mode === "vendor") {
			if (!vendorAssignmentId) {
				toast.error("Missing assignment for this shift");
				return;
			}
			vendorMutation.mutate(
				{
					assignmentId: vendorAssignmentId,
					payload: buildPayload(true),
				},
				{
					onSuccess: () => {
						toast.success("Timecard submitted for approval");
						onOpenChange(false);
					},
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Failed to submit timecard",
						),
				},
			);
			return;
		}
		candidateMutation.mutate(
			{ shiftId: shift.id, payload: buildPayload(true) },
			{
				onSuccess: () => {
					toast.success("Timecard submitted for approval");
					onOpenChange(false);
				},
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to submit timecard",
					),
			},
		);
	};

	const isSaving =
		mode === "candidate"
			? candidateMutation.isPending
			: vendorMutation.isPending;

	return {
		rows,
		notes,
		setNotes,
		updateRow,
		addOvertimeRow,
		removeRow,
		totalHours,
		estimatedPay,
		handleSaveDraft,
		handleSubmit,
		isSaving,
		timecardStatus: shift?.timecardStatus ?? null,
	};
}
