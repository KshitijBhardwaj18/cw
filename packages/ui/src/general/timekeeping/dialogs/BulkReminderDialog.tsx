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
import { Textarea } from "@repo/ui/components/textarea";
import { Banner } from "@repo/ui/general/Banner";
import { Bell, Send, Users } from "lucide-react";
import { useState } from "react";

interface BulkReminderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	targetType: "all" | "overdue";
	count: number;
	onConfirm?: (message: string) => void;
}

export function BulkReminderDialog({
	open,
	onOpenChange,
	targetType,
	count,
	onConfirm,
}: BulkReminderDialogProps) {
	const [message, setMessage] = useState(
		`Hello,\n\nOur records show you have missing time entries for recent shifts. Please ensure all time is submitted within the 48-hour deadline to avoid payment delays.`,
	);

	const handleConfirm = () => {
		onConfirm?.(message);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
							<Users className="text-primary size-5" />
						</div>
						<div className="space-y-0.5">
							<DialogTitle>
								Send Bulk Reminder (
								{targetType === "all" ? "All Workers" : "Overdue Only"})
							</DialogTitle>
							<DialogDescription className="text-sm font-medium">
								You are sending a notification to {count} workers.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<Banner
						variant="info"
						size="sm"
						icon={<Bell className="size-4" />}
						title="Confirmation Required"
						description={`This action will send unique notifications to ${count} identified workers via Email, SMS, and Mobile Push.`}
						className="border-blue-100 bg-blue-50/50"
					/>

					<div className="space-y-3">
						<label htmlFor="bulk-message" className="text-sm font-semibold">
							Notification Message
						</label>
						<Textarea
							id="bulk-message"
							rows={6}
							className="resize-none font-medium text-sm leading-relaxed"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>
						<p className="text-muted-foreground text-xs italic">
							The message will be automatically prefixed with each worker's
							name.
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
					<Button
						onClick={handleConfirm}
						variant={targetType === "overdue" ? "destructive" : "default"}
						className="gap-2 px-8"
					>
						<Send className="size-3.5" />
						Send to {count} Workers
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
