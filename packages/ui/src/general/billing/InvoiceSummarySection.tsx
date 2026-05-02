"use client";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { DetailItem } from "@repo/ui/components/detail-item";
import { Info } from "lucide-react";
import type { InvoiceDetail } from "./types";

export interface InvoiceSummarySectionProps {
	invoice: InvoiceDetail;
	formatCurrency: (amount: number) => string;
}

export function InvoiceSummarySection({
	invoice,
	formatCurrency,
}: InvoiceSummarySectionProps) {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
			<Card className="bg-blue-50/10 border-blue-100 shadow-none">
				<CardHeader className="border-b">
					<div className="flex items-center gap-2 text-blue-700">
						<Info className="size-4" />
						<CardTitle className="text-base font-semibold text-blue-800">
							Invoice Summary
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent className="space-y-4 pt-6">
					<DetailItem
						label="Subtotal"
						value={formatCurrency(invoice.subtotal)}
						variant="info"
						flow="row"
						className="border-b border-blue-100/50 pb-2.5"
					/>
					<DetailItem
						label="Tax"
						value={formatCurrency(invoice.taxAmount)}
						variant="info"
						flow="row"
						className="border-b border-blue-100/50 pb-2.5"
					/>
					<DetailItem
						label="Discount"
						value={`-${formatCurrency(invoice.discountAmount)}`}
						variant="info"
						flow="row"
						className="border-b border-blue-100/50 pb-2.5"
					/>
					<DetailItem
						label="Amount Paid"
						value={formatCurrency(invoice.amountPaid)}
						variant="info"
						flow="row"
					/>
				</CardContent>
			</Card>

			<Card className="h-fit border-slate-200 shadow-none">
				<CardHeader className="border-b">
					<CardTitle className="text-base font-semibold">
						Invoice Total
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6 space-y-4">
					<DetailItem
						label="Payment Terms"
						value={invoice.paymentTerms}
						flow="row"
					/>
					{invoice.notes && (
						<DetailItem label="Notes" value={invoice.notes} flow="row" />
					)}
				</CardContent>
				<CardFooter className="border-t p-6">
					<DetailItem
						label="Total Due"
						value={formatCurrency(invoice.totalAmount - invoice.amountPaid)}
						flow="row"
						className="w-full"
						labelClassName="text-base font-semibold text-foreground"
						valueClassName="text-lg font-semibold text-emerald-600 font-bold"
					/>
				</CardFooter>
			</Card>
		</div>
	);
}
