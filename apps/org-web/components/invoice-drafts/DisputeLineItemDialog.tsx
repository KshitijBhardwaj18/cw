"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { useMemo, useState } from "react";
import type { InvoiceDraftDetailLineItem } from "@/constants/invoice-draft-detail";
import { useOrgContext } from "@/contexts/org-context";
import { useCreateDispute } from "@/queries/timekeeping.queries";

type Props = {
	open: boolean;
	lineItem: InvoiceDraftDetailLineItem | null;
	onOpenChange: (open: boolean) => void;
	onSubmitted?: () => void;
};

export function DisputeLineItemDialog({
	open,
	lineItem,
	onOpenChange,
	onSubmitted,
}: Props) {
	const { id: orgId } = useOrgContext();
	const createDispute = useCreateDispute(orgId);
	const [reason, setReason] = useState("");

	const canSubmit = useMemo(() => {
		return (
			Boolean(lineItem?.timeEntryId) &&
			!lineItem?.disputed &&
			reason.trim().length > 0
		);
	}, [lineItem?.timeEntryId, lineItem?.disputed, reason]);

	const onSubmit = () => {
		if (!lineItem?.timeEntryId || !reason.trim() || lineItem.disputed) return;
		createDispute.mutate(
			{
				entryId: lineItem.timeEntryId,
				payload: {
					description: reason.trim(),
				},
			},
			{
				onSuccess: () => {
					setReason("");
					onOpenChange(false);
					onSubmitted?.();
				},
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Dispute Line Item</DialogTitle>
				</DialogHeader>
				{lineItem ? (
					<div className="space-y-4">
						<div className="grid grid-cols-1 gap-3 rounded-lg border p-3 text-sm sm:grid-cols-2">
							<div>
								<span className="text-muted-foreground">Worker:</span>{" "}
								<span className="font-medium">{lineItem.workerName}</span>
							</div>
							<div>
								<span className="text-muted-foreground">Date:</span>{" "}
								<span className="font-medium">{lineItem.dateLabel}</span>
							</div>
							<div>
								<span className="text-muted-foreground">Location:</span>{" "}
								<span className="font-medium">{lineItem.locationName}</span>
							</div>
							<div>
								<span className="text-muted-foreground">Pay Code:</span>{" "}
								<span className="font-medium">{lineItem.payCode}</span>
							</div>
							<div>
								<span className="text-muted-foreground">Hours:</span>{" "}
								<span className="font-medium">{lineItem.hours}</span>
							</div>
							<div>
								<span className="text-muted-foreground">Amount:</span>{" "}
								<span className="font-medium">
									${lineItem.amount.toFixed(2)}
								</span>
							</div>
						</div>
						<div className="space-y-2">
							<Label>
								{lineItem.disputed ? "Dispute Status" : "Dispute Reason *"}
							</Label>
							{lineItem.disputed ? (
								<div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
									<p>
										This line item is already disputed and excluded from invoice
										totals.
									</p>
									<div className="rounded border border-amber-200 bg-white/70 p-2">
										<p className="text-xs font-semibold uppercase tracking-wide">
											Reason
										</p>
										<p className="mt-1 whitespace-pre-wrap">
											{lineItem.disputeReason?.trim() ||
												"No dispute reason is available."}
										</p>
									</div>
								</div>
							) : (
								<Textarea
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									placeholder="Explain why this line item is being disputed..."
									className="min-h-[110px]"
								/>
							)}
						</div>
						<div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-sm font-medium text-sky-700">
							Disputed items will be excluded from this invoice total and
							flagged for vendor review and correction. They can be corrected
							and rebilled in a future invoice.
						</div>
					</div>
				) : null}
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{lineItem?.disputed ? "Close" : "Cancel"}
					</Button>
					{!lineItem?.disputed && (
						<Button
							onClick={onSubmit}
							disabled={!canSubmit || createDispute.isPending}
							className="bg-red-400 hover:bg-red-500"
						>
							Submit Dispute
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
