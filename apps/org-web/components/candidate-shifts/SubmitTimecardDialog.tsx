"use client";

import { formatUsdLedger, formatUsdPerHour } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { cn } from "@repo/ui/lib/utils";
import { format, parseISO } from "date-fns";
import { ArrowRight, Plus } from "lucide-react";
import { useId } from "react";
import { useSubmitShiftTimecardDialog } from "@/hooks/candidate/use-submit-shift-timecard-dialog";
import { useSubmitTimecardTableColumns } from "@/hooks/candidate/use-submit-timecard-table-columns";
import type { CandidateShiftListItem } from "@/types/candidate-shifts";
import { computeShiftHours } from "@/utils/time-entry";

interface SubmitTimecardDialogProps {
	isOpen: boolean;
	onClose: (open: boolean) => void;
	shift: CandidateShiftListItem | null;
	mode?: "candidate" | "vendor";
	vendorAssignmentId?: string;
}

export function SubmitTimecardDialog({
	isOpen,
	onClose,
	shift,
	mode = "candidate",
	vendorAssignmentId,
}: SubmitTimecardDialogProps) {
	const formId = useId();

	const {
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
		timecardStatus,
	} = useSubmitShiftTimecardDialog({
		mode,
		vendorAssignmentId,
		shift,
		isOpen,
		onOpenChange: onClose,
	});

	const dateLabel = shift
		? format(parseISO(shift.date), "EEEE, MMM d, yyyy")
		: "";

	const columns = useSubmitTimecardTableColumns({
		variant: "shift",
		dateLabel,
		updateRow,
		onRemoveOvertimeRow: removeRow,
	});

	if (!shift) return null;

	const regularRow = rows.find((r) => !r.isOvertime);
	const regularBreakMin = Number.parseInt(regularRow?.breakMin ?? "0", 10);
	const scheduledHours = computeShiftHours(
		shift.startTime,
		shift.endTime,
		Number.isNaN(regularBreakMin) ? 0 : regularBreakMin,
	);
	const overtimeHours = Math.max(0, totalHours - scheduledHours);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className="w-[min(100vw-2rem,52rem)] max-w-[min(100vw-2rem,52rem)] min-w-0 gap-0 p-0"
				showCloseButton
			>
				<div className="min-w-0 max-w-full space-y-6 p-6 pb-4">
					<DialogHeader className="gap-2 text-left">
						<DialogTitle className="text-2xl font-bold tracking-tight">
							Submit Timecard
						</DialogTitle>
						<DialogDescription asChild>
							<div className="text-muted-foreground space-y-1 text-sm">
								<p>{shift.title}</p>
								<p>
									{format(parseISO(shift.date), "EEEE, MMMM d, yyyy")} ·
									Scheduled: {shift.startTime} – {shift.endTime}
								</p>
							</div>
						</DialogDescription>
					</DialogHeader>

					{timecardStatus === "draft" && (
						<div className="rounded-lg border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
							Draft saved — update your times below and submit when ready.
						</div>
					)}
					{timecardStatus === "submitted" && (
						<div className="rounded-lg border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
							Last submitted — you can update times and save a new draft or
							submit again.
						</div>
					)}

					<div className="space-y-3">
						<h3 className="text-sm font-semibold text-foreground">
							Time Entries
						</h3>

						<div className="min-w-0 max-w-full rounded-lg border">
							<CustomTable
								data={rows}
								columns={columns}
								getRowId={(row) => row.id}
								className={cn(
									"rounded-none border-0 shadow-none",
									"[&_th]:whitespace-nowrap [&_td]:align-middle",
									"[&_th:first-child]:min-w-44 [&_th:nth-child(2)]:min-w-28 [&_th:nth-child(3)]:min-w-28",
									"[&_th:nth-child(4)]:min-w-26 [&_th:nth-child(5)]:w-22 [&_th:nth-child(5)]:text-right",
									"[&_th:last-child]:w-10",
								)}
							/>

							<div className="flex min-w-0 flex-wrap items-center justify-end gap-2 border-t bg-muted/20 px-3 py-2">
								<span className="min-w-0 flex-1 text-right text-sm font-medium text-muted-foreground">
									Total Hours:
								</span>
								<span
									className={cn(
										"shrink-0 rounded-md px-2 py-1 text-right font-mono text-sm font-semibold tabular-nums",
										"min-w-[4.5rem] bg-sky-100/80 dark:bg-sky-950/40",
									)}
								>
									{totalHours.toFixed(2)}
								</span>
								<div className="w-7 shrink-0" aria-hidden />
							</div>
						</div>

						<Button
							type="button"
							variant="outline"
							size="sm"
							className="gap-1.5"
							onClick={addOvertimeRow}
						>
							<Plus className="size-4" />
							Add Overtime
						</Button>
					</div>

					{overtimeHours > 0 && (
						<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900/40 dark:bg-amber-900/20">
							<p className="font-semibold text-amber-800 dark:text-amber-400">
								Overtime: {overtimeHours.toFixed(2)} hrs
							</p>
							<p className="text-amber-700/80 dark:text-amber-500/80 text-xs mt-0.5">
								{totalHours.toFixed(2)} actual hrs vs{" "}
								{scheduledHours.toFixed(2)} scheduled hrs
							</p>
						</div>
					)}

					<div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border bg-primary/5 px-4 py-3">
						<div className="min-w-0 space-y-0.5">
							<p className="text-xs text-muted-foreground font-medium">
								Estimated Pay
							</p>
							<p className="text-xl font-bold text-primary">
								{formatUsdLedger(estimatedPay)}
							</p>
						</div>
						<div className="min-w-0 max-w-full text-right space-y-0.5 sm:max-w-[55%]">
							<p className="text-xs text-muted-foreground font-medium">Rate</p>
							<p className="break-words text-sm font-semibold">
								{formatUsdPerHour(shift.ratePerHour)} × {totalHours.toFixed(2)}{" "}
								hrs
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor={`${formId}-notes`}>Notes (Optional)</Label>
						<Textarea
							id={`${formId}-notes`}
							placeholder="Add any notes about this shift..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={3}
							className="resize-y"
						/>
					</div>
				</div>

				<DialogFooter className="border-t bg-muted/20 px-6 py-4 sm:justify-start">
					<Button
						type="button"
						variant="outline"
						onClick={handleSaveDraft}
						disabled={isSaving}
					>
						Save as Draft
					</Button>
					<Button type="button" onClick={handleSubmit} disabled={isSaving}>
						Submit Timecard
						<ArrowRight className="size-4" />
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
