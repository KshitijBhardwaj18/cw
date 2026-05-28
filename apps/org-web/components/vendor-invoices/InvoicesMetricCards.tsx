"use client";

import { formatCurrency } from "@repo/shared";
import { MetricCard } from "@repo/ui/general/MetricCard";
import { DollarSign, FileText } from "lucide-react";
import type { VendorInvoiceMetricStats } from "@/types/vendor-invoices";

export interface InvoicesMetricCardsProps {
	stats?: VendorInvoiceMetricStats;
}

export function InvoicesMetricCards({
	stats,
}: Readonly<InvoicesMetricCardsProps>) {
	const safeStats: VendorInvoiceMetricStats = stats ?? {
		totalCount: 0,
		paidAmount: 0,
		pendingAmount: 0,
		draftAmount: 0,
	};
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<MetricCard
				variant="info"
				title="Total Invoices"
				value={safeStats.totalCount}
				icon={FileText}
			/>
			<MetricCard
				variant="success"
				title="Paid"
				value={formatCurrency(safeStats.paidAmount)}
				icon={DollarSign}
			/>
			<MetricCard
				variant="warning"
				title="Pending"
				value={formatCurrency(safeStats.pendingAmount)}
				icon={DollarSign}
			/>
			<MetricCard
				variant="inactive"
				title="Draft"
				value={formatCurrency(safeStats.draftAmount)}
				icon={FileText}
			/>
		</div>
	);
}
