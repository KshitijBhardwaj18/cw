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
import { XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type ComplianceRejectDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	itemName: string | null;
	onConfirm: (reason: string) => void;
	isSubmitting?: boolean;
};

export function ComplianceRejectDialog({
	open,
	onOpenChange,
	itemName,
	onConfirm,
	isSubmitting = false,
}: Readonly<ComplianceRejectDialogProps>) {
	const [reason, setReason] = useState("");

	useEffect(() => {
		if (!open) setReason("");
	}, [open]);

	const trimmed = reason.trim();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
				<DialogHeader className="flex flex-col items-start gap-1 text-left">
					<DialogTitle>Reject compliance item</DialogTitle>
					<DialogDescription className="mt-1">
						Optionally leave a note explaining what to fix — the candidate will
						see it on their wallet.
					</DialogDescription>
				</DialogHeader>

				{itemName && (
					<div className="rounded-lg border p-3 text-sm">
						<div className="text-muted-foreground">
							Item:{" "}
							<span className="text-foreground font-medium">{itemName}</span>
						</div>
					</div>
				)}

				<div className="space-y-2">
					<Label
						htmlFor="compliance-reject-reason"
						className="text-sm font-medium"
					>
						Reason (optional)
					</Label>
					<Textarea
						id="compliance-reject-reason"
						placeholder="e.g. wrong expiration date on file, blurry scan, wrong document type."
						className="min-h-[100px] resize-none"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>
				</div>

				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={() => onConfirm(trimmed)}
						disabled={isSubmitting}
					>
						<XCircle className="mr-1.5 size-4" />
						{isSubmitting ? "Rejecting…" : "Reject"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
