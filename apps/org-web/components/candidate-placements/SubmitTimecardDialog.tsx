"use client";

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
import { ArrowRight, Plus } from "lucide-react";
import { useId } from "react";
import { CANDIDATE_PORTAL_COPY } from "@/constants/candidate-portal";
import { useSubmitTimecardDialog } from "@/hooks/candidate/use-submit-timecard-dialog";
import { useSubmitTimecardTableColumns } from "@/hooks/candidate/use-submit-timecard-table-columns";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { CandidateTimecardDetail } from "@/types/candidate-timecard";

export interface SubmitTimecardDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	assignmentTitle: string;
	weekEnding: string;
	placementId: string;
	canMutate: boolean;
	initialDetail: CandidateTimecardDetail | undefined;
	isLoadingDetail: boolean;
	payCodeOptions?: Array<{
		id: string;
		code: string;
		description: string;
		multiplier?: number | null;
	}>;
}

export function SubmitTimecardDialog({
	open,
	onOpenChange,
	assignmentTitle,
	weekEnding,
	placementId,
	canMutate,
	initialDetail,
	isLoadingDetail,
	payCodeOptions = [],
}: Readonly<SubmitTimecardDialogProps>) {
	const formId = useId();
	const {
		weekRange,
		rows,
		notes,
		setNotes,
		addOvertimeRow,
		updateRow,
		totalHours,
		handleSaveDraft,
		handleSubmit,
		isSaving,
		isLoadingDetail: detailLoading,
	} = useSubmitTimecardDialog({
		canMutate,
		placementId,
		weekEnding,
		initialDetail,
		isLoadingDetail,
		onOpenChange,
	});

	const columns = useSubmitTimecardTableColumns({
		variant: "placement",
		weekRange,
		updateRow,
		payCodeOptions: initialDetail?.payCodes ?? payCodeOptions,
	});

	const { fmtCalendarDate } = useUserTimezone();
	const weekEndingLabel = fmtCalendarDate(weekEnding);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-h-[95dvh] max-w-[min(100vw-2rem,56rem)] gap-0 overflow-y-auto p-0 sm:max-w-4xl"
				showCloseButton
			>
				<div className="space-y-6 p-6 pb-4">
					{detailLoading ? (
						<p className="text-muted-foreground text-sm">
							{CANDIDATE_PORTAL_COPY.loadingDraft}
						</p>
					) : null}
					<DialogHeader className="gap-2 text-left">
						<DialogTitle className="text-2xl font-bold tracking-tight">
							Submit Timecard
						</DialogTitle>
						<DialogDescription asChild>
							<div className="text-muted-foreground space-y-1 text-sm">
								<p>{assignmentTitle}</p>
								<p>Week Ending: {weekEndingLabel}</p>
							</div>
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3">
						<h3 className="text-foreground text-sm font-semibold">
							Weekly Time Entry
						</h3>
						<div className="overflow-x-auto rounded-lg border">
							<CustomTable
								data={rows}
								columns={columns}
								getRowId={(row) => row.id}
								className={cn(
									"rounded-none border-0 shadow-none",
									"[&_th]:whitespace-nowrap [&_td]:align-middle",
									"[&_th:first-child]:min-w-44 [&_th:nth-child(2)]:min-w-28 [&_th:nth-child(3)]:min-w-28",
									"[&_th:nth-child(4)]:min-w-26 [&_th:nth-child(5)]:min-w-40",
									"[&_th:last-child]:w-22 [&_th:last-child]:text-right",
								)}
							/>
							<div
								className={cn(
									"flex items-center justify-end gap-2 border-t bg-muted/20 py-2 pr-2 pl-2",
								)}
							>
								<span className="min-w-0 flex-1 text-right text-sm font-medium">
									Total Hours:
								</span>
								<span
									className={cn(
										"w-22 shrink-0 rounded-md px-2 py-1 text-right font-mono text-sm font-semibold tabular-nums",
										"bg-sky-100/80 dark:bg-sky-950/40",
									)}
								>
									{totalHours.toFixed(2)}
								</span>
							</div>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="gap-1.5"
							onClick={addOvertimeRow}
						>
							<Plus className="size-4" aria-hidden />
							Add Overtime
						</Button>
					</div>

					<div className="space-y-2">
						<Label htmlFor={`${formId}-notes`}>Notes (Optional)</Label>
						<Textarea
							id={`${formId}-notes`}
							placeholder="Add any notes about this week's hours..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={4}
							className="resize-y"
						/>
					</div>
				</div>

				<DialogFooter className="border-t bg-muted/20 px-6 py-4 sm:justify-start">
					<Button
						type="button"
						variant="outline"
						onClick={handleSaveDraft}
						disabled={isSaving || detailLoading}
					>
						Save as Draft
					</Button>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={isSaving || detailLoading}
					>
						Submit Timecard
						<ArrowRight className="size-4" aria-hidden />
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
