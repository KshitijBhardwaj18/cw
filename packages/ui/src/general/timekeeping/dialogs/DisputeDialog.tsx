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
import { Textarea } from "@repo/ui/components/textarea";
import { cn } from "@repo/ui/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { TIMEKEEPING_POLICY_DEFAULTS } from "../constants";
import type { TimeLog, WorkerTimekeeping } from "../types";

const MIN_REASON_LENGTH = 20;

interface DisputeDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (reason: string) => void;
	log: TimeLog | null;
	worker: WorkerTimekeeping | null;
}

export function DisputeDialog({
	isOpen,
	onClose,
	onSubmit,
	log,
	worker,
}: Readonly<DisputeDialogProps>) {
	const [reason, setReason] = useState("");
	const isValid = reason.trim().length >= MIN_REASON_LENGTH;

	const handleClose = () => {
		setReason("");
		onClose();
	};

	const handleSubmit = () => {
		if (!isValid) return;
		onSubmit(reason.trim());
		setReason("");
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>File Dispute</DialogTitle>
					<DialogDescription>
						Dispute requires a detailed reason for review
					</DialogDescription>
				</DialogHeader>

				{log && worker && (
					<>
						<div className="rounded-lg border p-4">
							<div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
								<div className="text-muted-foreground">
									Worker:{" "}
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
									Punch In Time:{" "}
									<span className="text-foreground font-medium">
										{log.startTime}
									</span>
								</div>
								<div className="text-muted-foreground">
									Punch Out Time:{" "}
									<span className="text-foreground font-medium">
										{log.endTime}
									</span>
								</div>
								<div className="text-muted-foreground">
									Pay Code:{" "}
									<span className="text-foreground font-medium">
										{log.payCode}
									</span>
								</div>
								<div className="text-muted-foreground">
									Total Hours:{" "}
									<span className="text-foreground font-medium">
										{log.totalHours}h
									</span>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<label htmlFor="dispute-reason" className="text-sm font-medium">
								Dispute Reason <span className="text-destructive">*</span>
							</label>
							<Textarea
								id="dispute-reason"
								placeholder={`Provide a detailed explanation for this dispute (minimum ${MIN_REASON_LENGTH} characters)...`}
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								rows={4}
								className={cn(
									"resize-none",
									reason.length > 0 &&
										reason.trim().length < MIN_REASON_LENGTH &&
										"border-destructive focus-visible:ring-destructive/30",
								)}
							/>
							<p
								className={cn(
									"text-xs",
									reason.trim().length < MIN_REASON_LENGTH
										? "text-muted-foreground"
										: "text-green-600 dark:text-green-400",
								)}
							>
								{reason.trim().length} / {MIN_REASON_LENGTH} minimum characters
							</p>
						</div>

						<div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 dark:border-amber-900/30 dark:bg-amber-900/10">
							<AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
							<div className="text-sm text-amber-800 dark:text-amber-400">
								<p className="font-semibold">
									Dispute Window:{" "}
									{TIMEKEEPING_POLICY_DEFAULTS.submissionDeadlineDays} days from
									submitted date
								</p>
								<p className="mt-1">
									Once submitted, the dispute will notify assigned approvers via
									email and in-platform notification. Critical disputes require
									immediate attention.
								</p>
							</div>
						</div>
					</>
				)}

				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Button type="button" variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button type="button" disabled={!isValid} onClick={handleSubmit}>
						Submit Dispute
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
