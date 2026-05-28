"use client";

import { formatDate } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Textarea } from "@repo/ui/components/textarea";
import { Bell, Send } from "lucide-react";
import { useEffect, useState } from "react";
import type { MissingTimeEntry } from "../types";

interface SendReminderDialogProps {
	worker: MissingTimeEntry | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm?: (message: string) => void;
}

export function SendReminderDialog({
	worker,
	open,
	onOpenChange,
	onConfirm,
}: Readonly<SendReminderDialogProps>) {
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (worker) {
			const formattedDates = worker.missingDates
				.map((d) => formatDate(d))
				.join(", ");
			setMessage(
				`Hi ${worker.workerName || "Worker"},\n\nYou have missing time entries for the following dates: ${formattedDates || ""}. Please submit them as soon as possible to ensure timely payment.`,
			);
		}
	}, [worker]);

	if (!worker) return null;

	const handleConfirm = () => {
		onConfirm?.(message);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
							<Bell className="text-primary size-5" />
						</div>
						<div className="space-y-0.5">
							<DialogTitle>Send Reminder</DialogTitle>
							<DialogDescription>
								Notify {worker.workerName} regarding their missing time entries.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="bg-muted/30 rounded-lg border p-4">
						<div className="grid grid-cols-2 gap-y-4">
							<div className="space-y-1">
								<span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
									Worker
								</span>
								<p className="text-sm font-medium">{worker.workerName}</p>
							</div>
							<div className="space-y-1">
								<span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
									Assignment
								</span>
								<p className="text-sm font-medium">{worker.position}</p>
							</div>
							<div className="col-span-2 space-y-1">
								<span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
									Missing Dates
								</span>
								<div className="mt-1 flex flex-wrap gap-1.5">
									{worker.missingDates.map((date) => (
										<Badge key={date} variant="warning">
											{formatDate(date)}
										</Badge>
									))}
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<label htmlFor="message" className="text-sm font-semibold">
							Message Preview
						</label>
						<Textarea
							id="message"
							rows={5}
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>
						<p className="text-muted-foreground text-xs italic">
							The worker will receive this message via their preferred
							notification method (Email, SMS, or Push).
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						className="text-muted-foreground"
					>
						Cancel
					</Button>
					<Button onClick={handleConfirm} className="gap-2 px-8">
						<Send className="size-3.5" />
						Send Reminder
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
