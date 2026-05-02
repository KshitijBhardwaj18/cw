"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { Label } from "@repo/ui/components/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@repo/ui/components/sheet";
import { Textarea } from "@repo/ui/components/textarea";
import { Banner } from "@repo/ui/general/Banner";
import { DNDDocumentUpload } from "@repo/ui/general/DNDDocumentUpload";
import RequiredStar from "@repo/ui/general/RequiredStar";
import { AlertCircle, Info } from "lucide-react";
import { useState } from "react";
import type { InvoiceLineItem, PayCode } from "../types";

// Local currency formatter
const CURRENCY_FMT = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
});

function fmtCurrency(amount: number | null | undefined): string {
	if (amount == null) return "$0.00";
	return CURRENCY_FMT.format(amount);
}

export interface DisputeLineItemSheetProps {
	isOpen: boolean;
	onClose: () => void;
	lineItem: InvoiceLineItem | null;
	payCodes?: PayCode[];
	onSubmit?: (payload: {
		lineItem: InvoiceLineItem;
		reason: string;
		files: File[];
	}) => void | Promise<void>;
	isSubmitting?: boolean;
}

export function DisputeLineItemSheet({
	isOpen,
	onClose,
	lineItem,
	payCodes = [],
	onSubmit,
	isSubmitting = false,
}: DisputeLineItemSheetProps) {
	const [files, setFiles] = useState<File[]>([]);
	const [reason, setReason] = useState("");

	if (!lineItem) return null;

	const handleSubmit = async () => {
		if (!lineItem || !reason.trim()) return;
		await onSubmit?.({
			lineItem,
			reason: reason.trim(),
			files,
		});
	};

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className="p-6 overflow-y-auto">
				<SheetHeader className="p-0 mb-6">
					<SheetTitle className="text-xl">
						{lineItem.description} - Dispute
					</SheetTitle>
					<SheetDescription>
						Flag this specific line item for review
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-6">
					<Card className="bg-primary/5 border-primary/10">
						<CardContent className="space-y-1.5 pt-6">
							<DetailItem
								label="Description"
								value={lineItem.description}
								flow="row"
							/>
							<DetailItem label="Reference ID" value={lineItem.id} flow="row" />
							<DetailItem
								label="Total Amount"
								value={fmtCurrency(lineItem.amount)}
								flow="row"
							/>
						</CardContent>
					</Card>

					<div className="space-y-3">
						<Label>
							Dispute Reason <RequiredStar />
						</Label>
						<Textarea
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Provide specific details on the discrepancy (e.g., incorrect hours, wrong bill rate, unapproved overtime)"
							className="min-h-[120px]"
						/>
						<p className="text-xs text-muted-foreground">
							Be as specific as possible to expedite resolution
						</p>
					</div>

					<DNDDocumentUpload
						label="Supporting Documents"
						files={files}
						onFilesChange={setFiles}
					/>

					{payCodes.length > 0 && (
						<Card className="bg-blue-50/30 border-blue-100">
							<CardHeader className="flex flex-row items-center gap-2 border-b border-blue-100/50 py-3">
								<Info className="size-4 text-blue-700" />
								<CardTitle className="text-base text-blue-800">
									Pay Code Reference
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 py-4">
								{payCodes.map((item) => (
									<DetailItem
										key={item.id || item.code}
										label={item.description}
										value={
											item.multiplier != null ? `${item.multiplier}x` : "1x"
										}
										variant="info"
										flow="row"
									/>
								))}
							</CardContent>
							<CardFooter className="text-sm text-blue-700 pb-4">
								Use this reference to identify calculation errors in the line
								item
							</CardFooter>
						</Card>
					)}

					<Banner
						variant="warning"
						size="sm"
						icon={<AlertCircle className="size-4" />}
						title="Note"
						description={
							<span className="text-xs leading-normal">
								Disputed items will be excluded from the invoice total and held
								for resolution. The vendor will be notified of the dispute.
							</span>
						}
					/>
				</div>

				<SheetFooter className="p-0 mt-8 flex-col gap-3 sm:flex-col">
					<Button
						className="w-full"
						onClick={handleSubmit}
						disabled={!reason.trim() || isSubmitting}
					>
						Submit Dispute
					</Button>
					<Button
						variant="outline"
						className="w-full"
						onClick={onClose}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
