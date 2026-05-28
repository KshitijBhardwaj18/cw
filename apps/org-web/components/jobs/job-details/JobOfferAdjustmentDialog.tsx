"use client";

import { Button } from "@repo/ui/components/button";
import { DatePicker } from "@repo/ui/components/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { SubmissionListRow } from "@/constants/submissions";

export interface JobOfferAdjustmentDefaults {
	/** `yyyy-MM-dd` strings (same format as `DatePicker` values). */
	startDate: string;
	endDate: string;
	billRate: number | null;
}

export interface JobOfferAdjustmentDialogProps {
	open: boolean;
	row: SubmissionListRow | null;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	/** From requisition detail — applied when the dialog opens */
	offerDefaults?: JobOfferAdjustmentDefaults | null;
	onConfirm: (params: {
		startDate: string;
		endDate: string;
		billRate: number | null;
	}) => void;
}

export function JobOfferAdjustmentDialog({
	open,
	row,
	isPending,
	onOpenChange,
	offerDefaults,
	onConfirm,
}: Readonly<JobOfferAdjustmentDialogProps>) {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [billRate, setBillRate] = useState("");
	const wasOpenRef = useRef(false);

	useEffect(() => {
		if (open && !wasOpenRef.current) {
			const d = offerDefaults;
			setStartDate(d?.startDate ?? "");
			setEndDate(d?.endDate ?? "");
			setBillRate(
				d?.billRate != null && Number.isFinite(d.billRate)
					? String(d.billRate)
					: "",
			);
		}
		wasOpenRef.current = open;
	}, [open, offerDefaults]);

	function handleOpenChange(next: boolean) {
		if (!next) {
			setStartDate("");
			setEndDate("");
			setBillRate("");
		}
		onOpenChange(next);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!startDate.trim()) {
			toast.error("Start date is required.");
			return;
		}
		if (!endDate.trim()) {
			toast.error("End date is required.");
			return;
		}
		onConfirm({
			startDate,
			endDate,
			billRate: billRate !== "" ? Number(billRate) : null,
		});
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Offer Adjustment</DialogTitle>
					<DialogDescription>
						Configure placement information
						{row ? ` for ${row.candidateName}` : ""}.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 py-2">
					<div className="space-y-1.5">
						<Label htmlFor="offer-start-date">Start Date</Label>
						<DatePicker
							id="offer-start-date"
							value={startDate}
							onChange={setStartDate}
							placeholder="Pick start date"
							max={endDate || undefined}
							clearable
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="offer-end-date">End Date</Label>
						<DatePicker
							id="offer-end-date"
							value={endDate}
							onChange={setEndDate}
							placeholder="Pick end date"
							min={startDate || undefined}
							clearable
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="offer-bill-rate">Adjust Bill Rate</Label>
						<Input
							id="offer-bill-rate"
							type="number"
							min="0"
							step="0.01"
							placeholder="e.g. 85.00"
							value={billRate}
							onChange={(e) => setBillRate(e.target.value)}
						/>
					</div>
					<DialogFooter className="pt-2">
						<Button
							type="button"
							variant="outline"
							disabled={isPending}
							onClick={() => handleOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Saving…" : "Save Details"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
