"use client";

import { formatCurrency, shortId } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { cn } from "@repo/ui/lib/utils";
import { Calculator } from "lucide-react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import { useVendorInvoiceBreakdown } from "@/queries/vendor-invoices.queries";
import type { VendorInvoiceRow } from "@/types/vendor-invoices";

export interface InvoiceBreakdownDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	invoice: VendorInvoiceRow | null;
}

export function InvoiceBreakdownDialog({
	open,
	onOpenChange,
	invoice,
}: Readonly<InvoiceBreakdownDialogProps>) {
	const { fmtPeriod, fmtShortDate } = useUserTimezone();
	const breakdownQuery = useVendorInvoiceBreakdown(invoice?.id);
	if (!invoice) {
		return null;
	}
	if (breakdownQuery.isLoading) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Invoice Calculation Breakdown</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">Loading...</p>
				</DialogContent>
			</Dialog>
		);
	}
	if (breakdownQuery.isError) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Invoice Calculation Breakdown</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-destructive">
						Failed to load invoice breakdown.
					</p>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								void breakdownQuery.refetch();
							}}
						>
							Retry
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}
	const b = breakdownQuery.data;
	if (!b) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90dvh] min-h-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
				<DialogHeader className="border-border shrink-0 space-y-0 border-b px-6 py-4">
					<div className="flex items-center gap-2">
						<Calculator className="text-muted-foreground size-5 shrink-0" />
						<DialogTitle className="text-left">
							Invoice Calculation Breakdown
						</DialogTitle>
					</div>
				</DialogHeader>

				<div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
					<div className="bg-muted/80 grid grid-cols-1 gap-3 rounded-lg p-4 sm:grid-cols-2">
						<BreakdownMeta
							label="Invoice ID"
							value={shortId(b.invoiceId)}
							title={b.invoiceId}
						/>
						<BreakdownMeta label="Organization" value={b.organization} />
						<BreakdownMeta
							label="Period"
							value={fmtPeriod(b.periodStartDate, b.periodEndDate)}
						/>
						<BreakdownMeta label="Due Date" value={fmtShortDate(b.dueDate)} />
					</div>

					<div>
						<p className="mb-3 text-sm font-semibold">Calculation Formula</p>
						<div className="space-y-4">
							<section className="space-y-2 rounded-lg border bg-card p-4">
								<p className="text-muted-foreground text-xs font-medium">
									Step 1: Calculate Gross Amount
								</p>
								<div className="bg-muted/60 rounded-md px-3 py-2 font-mono text-sm">
									Bill Rate × Hours × Multiplier
								</div>
								<div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
									<span className="text-muted-foreground tabular-nums">
										{formatCurrency(b.billRate)} × {b.hours} × {b.multiplier}
									</span>
									<span className="font-semibold tabular-nums">
										= {formatCurrency(b.grossAmount)}
									</span>
								</div>
							</section>

							<section className="space-y-2 rounded-lg border bg-card p-4">
								<p className="text-muted-foreground text-xs font-medium">
									Step 2: Calculate Total Deductions
								</p>
								<ul className="space-y-2">
									{b.deductionLines.map((line) => (
										<li
											key={`${line.label}-${line.percent}`}
											className="flex justify-between gap-2 text-sm"
										>
											<span>
												{line.label} ({line.percent}%)
											</span>
											<span className="font-medium text-red-600 tabular-nums dark:text-red-400">
												-{formatCurrency(line.amount)}
											</span>
										</li>
									))}
								</ul>
								<div className="border-border flex justify-between border-t pt-2 text-sm">
									<span className="font-medium">Total Deductions</span>
									<span className="font-bold text-red-600 tabular-nums dark:text-red-400">
										-{formatCurrency(b.totalDeductions)}
									</span>
								</div>
							</section>

							<section
								className={cn(
									"space-y-2 rounded-lg border border-cyan-200 bg-cyan-50/80 p-4",
									"dark:border-cyan-900/50 dark:bg-cyan-950/40",
								)}
							>
								<p className="text-cyan-900 text-xs font-medium dark:text-cyan-200">
									Step 3: Final Amount Post-Deduction
								</p>
								<div className="bg-background rounded-md px-3 py-2 font-mono text-sm">
									Gross Amount − Total Deductions
								</div>
								<div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
									<span className="text-muted-foreground tabular-nums">
										{formatCurrency(b.grossAmount)} -{" "}
										{formatCurrency(b.totalDeductions)}
									</span>
									<span className="text-lg font-bold text-emerald-700 tabular-nums dark:text-emerald-400">
										= {formatCurrency(b.finalAmount)}
									</span>
								</div>
							</section>
						</div>
					</div>
				</div>

				<DialogFooter className="border-border shrink-0 border-t px-6 py-4">
					<Button
						type="button"
						className="bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500"
						onClick={() => {
							onOpenChange(false);
						}}
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function BreakdownMeta({
	label,
	value,
	title,
}: Readonly<{
	label: string;
	value: string;
	title?: string;
}>) {
	return (
		<div>
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="mt-0.5 text-sm font-semibold" title={title}>
				{value}
			</p>
		</div>
	);
}
