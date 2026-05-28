"use client";

import { formatDateRange } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { TimeLog, WorkerTimekeeping } from "../types";

interface ApproveTimeLogDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (note?: string) => void;
	log: TimeLog | null;
	worker: WorkerTimekeeping | null;
	mode?: "approval" | "dispute-resolution";
}

export function ApproveTimeLogDialog({
	isOpen,
	onClose,
	onConfirm,
	log,
	worker,
	mode = "approval",
}: Readonly<ApproveTimeLogDialogProps>) {
	const [note, setNote] = useState("");

	useEffect(() => {
		if (!isOpen) setNote("");
	}, [isOpen]);

	const isDisputeResolution = mode === "dispute-resolution";
	const title = isDisputeResolution ? "Resolve Dispute" : "Approve Time Entry";
	const description = isDisputeResolution
		? "Confirm this resolution to mark the dispute as resolved."
		: "You are about to approve this time entry. This action will mark the timecard as approved.";
	const confirmLabel = isDisputeResolution
		? "Confirm Resolution"
		: "Approve Entry";
	const confirmIconLabel = isDisputeResolution
		? "Resolve dispute"
		: "Approve entry";
	const workerLabel = isDisputeResolution ? "Dispute for" : "Worker";
	const hoursLabel = isDisputeResolution ? "Hours" : "Total Hours";
	const startLabel = isDisputeResolution ? "Punch In Time" : "Start";
	const endLabel = isDisputeResolution ? "Punch Out Time" : "End";

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader className="flex flex-col items-start gap-1 text-left">
					<div>
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription className="mt-1">
							{description}
						</DialogDescription>
					</div>
				</DialogHeader>

				{log && worker && (
					<div className="rounded-lg border p-4">
						<div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
							<div className="text-muted-foreground">
								{workerLabel}:{" "}
								<span className="text-foreground font-medium">
									{worker.name}
								</span>
							</div>
							<div className="text-muted-foreground">
								Period:{" "}
								<span className="text-foreground font-medium">
									{formatDateRange(log.startDate, log.endDate)}
								</span>
							</div>
							<div className="text-muted-foreground">
								Pay Code:{" "}
								<span className="text-foreground font-medium">
									{log.payCode}
								</span>
							</div>
							<div className="text-muted-foreground">
								{hoursLabel}:{" "}
								<span className="text-foreground font-medium">
									{log.totalHours}h
								</span>
							</div>
							<div className="text-muted-foreground">
								{startLabel}:{" "}
								<span className="text-foreground font-medium">
									{log.startTime}
								</span>
							</div>
							<div className="text-muted-foreground">
								{endLabel}:{" "}
								<span className="text-foreground font-medium">
									{log.endTime}
								</span>
							</div>
						</div>
					</div>
				)}

				{isDisputeResolution && (
					<div className="space-y-2">
						<Label htmlFor="resolution-note" className="text-sm font-medium">
							Resolution Notes <RequiredStar />
						</Label>
						<Textarea
							id="resolution-note"
							placeholder="Explain the resolution action (e.g., 'Confirmed with supervisor - hours will be adjusted to 6 hours in payroll system')..."
							className="min-h-[100px] resize-none"
							value={note}
							onChange={(e) => setNote(e.target.value)}
						/>
						<p className="text-xs text-muted-foreground">
							Describe the action taken or planned to address this dispute
						</p>
					</div>
				)}

				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="button"
						className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
						onClick={() => onConfirm(note)}
						disabled={isDisputeResolution && !note.trim()}
					>
						<CheckCircle2 className="mr-1.5 size-4" />
						<span>{confirmLabel}</span>
						<span className="sr-only">{confirmIconLabel}</span>
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
