"use client";

import { formatCurrency } from "@repo/shared";
import { Card, CardContent } from "@repo/ui/components/card";
import {
	TINTED_METRIC_TONE_STYLES,
	TintedMetricCard,
} from "@repo/ui/general/TintedMetricCard";
import { cn } from "@repo/ui/lib/utils";
import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	DollarSign,
	FileText,
} from "lucide-react";
import type { InvoiceDraftListSummary } from "@/services/billing.service";

const EMPTY_SUMMARY: InvoiceDraftListSummary = {
	draftCount: 0,
	totalAmount: 0,
	approvedAmount: 0,
	disputedAmount: 0,
	totalBillableHours: 0,
};

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

export type InvoiceDraftsMetricCardsProps = {
	summary?: InvoiceDraftListSummary;
};

export function InvoiceDraftsMetricCards({
	summary,
}: InvoiceDraftsMetricCardsProps) {
	const s = summary ?? EMPTY_SUMMARY;

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
			<TintedMetricCard
				tone="sky"
				title="Draft invoices"
				value={s.draftCount}
				titleTrailing={iconWrap("sky", FileText)}
				footer={
					<p className="text-muted-foreground mt-2 text-xs">Pending review</p>
				}
			/>
			<TintedMetricCard
				tone="emerald"
				title="Total amount"
				value={formatCurrency(s.totalAmount)}
				titleTrailing={iconWrap("emerald", DollarSign)}
				footer={
					<p className="text-muted-foreground mt-2 text-xs">All drafts</p>
				}
			/>
			<TintedMetricCard
				tone="emerald"
				title="Approved"
				value={formatCurrency(s.approvedAmount)}
				titleTrailing={iconWrap("emerald", CheckCircle2)}
				footer={
					<p className="text-muted-foreground mt-2 text-xs">
						Ready to finalize
					</p>
				}
			/>
			<Card className="rounded-xl border border-red-200 bg-red-50/50 py-0 shadow-sm dark:border-red-900/40 dark:bg-red-950/30">
				<CardContent className="p-4">
					<div className="flex items-start justify-between gap-2">
						<p className="text-xs font-medium text-red-800 dark:text-red-200">
							Disputed
						</p>
						<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200">
							<AlertTriangle className="size-4" />
						</div>
					</div>
					<p className="mt-1 text-2xl font-bold tabular-nums text-red-700 dark:text-red-100">
						{formatCurrency(s.disputedAmount)}
					</p>
					<p className="text-muted-foreground mt-2 text-xs">
						Requires resolution
					</p>
				</CardContent>
			</Card>
			<TintedMetricCard
				tone="violet"
				title="Total hours"
				value={s.totalBillableHours.toLocaleString()}
				titleTrailing={iconWrap("violet", Clock)}
				footer={
					<p className="text-muted-foreground mt-2 text-xs">Billable hours</p>
				}
			/>
		</div>
	);
}
