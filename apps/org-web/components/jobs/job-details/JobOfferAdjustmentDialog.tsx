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
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useState } from "react";
import type { SubmissionListRow } from "@/constants/submissions";

export interface JobOfferAdjustmentDialogProps {
	open: boolean;
	row: SubmissionListRow | null;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
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
	onConfirm,
}: JobOfferAdjustmentDialogProps) {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [billRate, setBillRate] = useState("");

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
						<Input
							id="offer-start-date"
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="offer-end-date">End Date</Label>
						<Input
							id="offer-end-date"
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							required
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
