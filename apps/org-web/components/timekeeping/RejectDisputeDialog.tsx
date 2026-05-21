"use client";

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
import { XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { DisputeLogEntry } from "@/types/timekeeping";

type RejectDisputeDialogProps = {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (reason: string) => void;
	dispute: DisputeLogEntry | null;
};

export function RejectDisputeDialog({
	isOpen,
	onClose,
	onConfirm,
	dispute,
}: RejectDisputeDialogProps) {
	const [reason, setReason] = useState("");

	useEffect(() => {
		if (!isOpen) setReason("");
	}, [isOpen]);

	const trimmed = reason.trim();
	const canSubmit = trimmed.length > 0;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
				<DialogHeader className="flex flex-col items-start gap-1 text-left">
					<DialogTitle>Reject dispute</DialogTitle>
					<DialogDescription className="mt-1">
						Provide a reason for rejecting this dispute. The worker and dispute
						history will show this explanation.
					</DialogDescription>
				</DialogHeader>

				{dispute && (
					<div className="rounded-lg border p-4 text-sm">
						<div className="text-muted-foreground">
							Worker:{" "}
							<span className="text-foreground font-medium">
								{dispute.workerName}
							</span>
						</div>
						<div className="mt-1 text-muted-foreground">
							Date:{" "}
							<span className="text-foreground font-medium">
								{dispute.date}
							</span>
						</div>
						<div className="mt-2 text-muted-foreground">
							Original dispute:{" "}
							<span className="text-foreground">{dispute.disputeReason}</span>
						</div>
					</div>
				)}

				<div className="space-y-2">
					<Label htmlFor="reject-reason" className="text-sm font-medium">
						Rejection reason <RequiredStar />
					</Label>
					<Textarea
						id="reject-reason"
						placeholder="Explain why this dispute is being rejected (e.g. policy, missing documentation)…"
						className="min-h-[100px] resize-none"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>
				</div>

				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={() => {
							if (!canSubmit) return;
							onConfirm(trimmed);
						}}
						disabled={!canSubmit}
					>
						<XCircle className="mr-1.5 size-4" />
						Reject dispute
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
