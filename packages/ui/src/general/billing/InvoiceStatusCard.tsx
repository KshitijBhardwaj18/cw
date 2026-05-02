"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { invoiceStatusVariants } from "./constants";
import { INVOICE_STATUS_OPTIONS, type InvoiceStatus } from "./types";

export interface InvoiceStatusCardProps {
	currentStatus: InvoiceStatus;
	hasStatusChanged: boolean;
	isUpdatingStatus: boolean;
	onStatusChange: (status: InvoiceStatus) => void;
	onUpdateStatus: () => void;
	onRevertStatus: () => void;
	readOnly?: boolean;
}

export function InvoiceStatusCard({
	currentStatus,
	hasStatusChanged,
	isUpdatingStatus,
	onStatusChange,
	onUpdateStatus,
	onRevertStatus,
	readOnly = false,
}: InvoiceStatusCardProps) {
	if (readOnly) {
		return (
			<Card>
				<CardContent className="flex items-center py-4">
					<div className="flex flex-col gap-1.5">
						<span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
							Invoice status
						</span>
						<Badge variant={invoiceStatusVariants[currentStatus] ?? "inactive"}>
							{currentStatus}
						</Badge>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardContent className="flex justify-between items-center py-4">
				<div className="flex flex-col gap-1.5">
					<span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
						Update Invoice Status
					</span>
					<div className="flex items-center gap-3">
						<Select
							value={currentStatus}
							onValueChange={onStatusChange as (v: string) => void}
						>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								{INVOICE_STATUS_OPTIONS.map((s) => (
									<SelectItem key={s} value={s}>
										{s}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Badge variant={invoiceStatusVariants[currentStatus] ?? "inactive"}>
							Current: {currentStatus}
						</Badge>
					</div>
				</div>
				<div className="flex items-center gap-3">
					{hasStatusChanged && (
						<Button variant="ghost" onClick={onRevertStatus}>
							Cancel
						</Button>
					)}
					<Button
						disabled={!hasStatusChanged || isUpdatingStatus}
						onClick={onUpdateStatus}
					>
						{isUpdatingStatus ? "Updating…" : "Update"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
