"use client";

import { formatCurrency } from "@repo/shared";
import { Card, CardContent } from "@repo/ui/components/card";
import {
	TINTED_METRIC_TONE_STYLES,
	TintedMetricCard,
} from "@repo/ui/general/TintedMetricCard";
import { cn } from "@repo/ui/lib/utils";
import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import type { FinalInvoiceSummary } from "@/services/billing.service";

const iconWrap = (
	tone: keyof typeof TINTED_METRIC_TONE_STYLES,
	Icon: typeof FileText,
) => {
	const styles = TINTED_METRIC_TONE_STYLES[tone];
	return (
		<div
			className={cn(
				"flex size-8 shrink-0 items-center justify-center rounded-full",
				styles.iconWrap,
			)}
		>
			<Icon className="size-4" />
		</div>
	);
};

const EMPTY_SUMMARY: FinalInvoiceSummary = {
	totalCount: 0,
	totalAmount: 0,
	paidCount: 0,
	paidAmount: 0,
	pendingCount: 0,
	pendingAmount: 0,
	overdueCount: 0,
	overdueAmount: 0,
};

export function FinalInvoicesMetricCards({
	summary,
}: {
	summary?: FinalInvoiceSummary;
}) {
	const s = summary ?? EMPTY_SUMMARY;

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<TintedMetricCard
				tone="violet"
				title="Total Invoices"
				value={s.totalCount}
				titleTrailing={iconWrap("violet", FileText)}
				footer={
					<p className="text-muted-foreground mt-2 text-xs tabular-nums">
						{formatCurrency(s.totalAmount)}
					</p>
				}
			/>
			<TintedMetricCard
				tone="emerald"
				title="Paid"
				value={s.paidCount}
				titleTrailing={iconWrap("emerald", CheckCircle2)}
				footer={
					<p className="text-muted-foreground mt-2 text-xs tabular-nums">
						{formatCurrency(s.paidAmount)}
					</p>
				}
			/>
			<TintedMetricCard
				tone="sky"
				title="Pending Payment"
				value={s.pendingCount}
				titleTrailing={iconWrap("sky", Clock)}
				footer={
					<p className="text-muted-foreground mt-2 text-xs tabular-nums">
						{formatCurrency(s.pendingAmount)}
					</p>
				}
			/>
			<Card className="rounded-xl border border-red-200 bg-red-50/50 py-0 shadow-sm dark:border-red-900/40 dark:bg-red-950/30">
				<CardContent className="p-4">
					<div className="flex items-start justify-between gap-2">
						<p className="text-xs font-medium text-red-800 dark:text-red-200">
							Overdue
						</p>
						<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200">
							<XCircle className="size-4" />
						</div>
					</div>
					<p className="mt-1 text-2xl font-bold tabular-nums text-red-700 dark:text-red-100">
						{s.overdueCount}
					</p>
					<p className="text-muted-foreground mt-2 text-xs tabular-nums">
						{formatCurrency(s.overdueAmount)}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
