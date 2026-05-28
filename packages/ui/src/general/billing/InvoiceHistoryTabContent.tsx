"use client";

import { shortId } from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { AlertCircle, Eye } from "lucide-react";
import {
	SearchWithFilters,
	type SearchWithFiltersFilterConfig,
} from "../../shared/SearchWithFilters";
import { invoiceStatusVariants } from "./constants";
import { useInvoiceHistoryColumns } from "./hooks/use-invoice-history-columns";
import type { InvoiceHistoryItem } from "./types";

export interface InvoiceHistoryTabContentProps {
	allInvoices: InvoiceHistoryItem[];
	pendingInvoices: InvoiceHistoryItem[];
	pendingAttentionTotal?: number;
	pendingListLoading?: boolean;
	searchValue: string;
	onSearchChange: (value: string) => void;
	filtersExpanded: boolean;
	onFiltersExpandedChange: (expanded: boolean) => void;
	filterConfigs: SearchWithFiltersFilterConfig[];
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	onViewInvoice: (invoice: InvoiceHistoryItem) => void;
	onDownloadPDF: (invoice: InvoiceHistoryItem) => void;
	onExportData: (invoice: InvoiceHistoryItem) => void;
	isLoading?: boolean;
}

export function InvoiceHistoryTabContent({
	allInvoices,
	pendingInvoices,
	pendingAttentionTotal,
	pendingListLoading,
	searchValue,
	onSearchChange,
	filtersExpanded,
	onFiltersExpandedChange,
	filterConfigs,
	page,
	totalPages,
	onPageChange,
	onViewInvoice,
	onDownloadPDF,
	onExportData,
	isLoading,
}: Readonly<InvoiceHistoryTabContentProps>) {
	const { columns } = useInvoiceHistoryColumns({
		onViewInvoice,
		onDownloadPDF,
		onExportData,
	});

	const pendingSummaryCount =
		pendingAttentionTotal !== undefined
			? pendingAttentionTotal
			: pendingInvoices.length;
	const showPendingBanner =
		pendingAttentionTotal !== undefined
			? pendingAttentionTotal > 0
			: pendingInvoices.length > 0;
	const pendingListTruncated =
		pendingAttentionTotal !== undefined &&
		pendingAttentionTotal > pendingInvoices.length;

	return (
		<div className="space-y-6">
			{showPendingBanner && (
				<div className="rounded border border-destructive/20 bg-destructive/5 p-4">
					<div className="flex flex-col gap-3">
						<div className="flex-1 space-y-6">
							<div className="flex gap-1">
								<div className="p-2">
									<AlertCircle className="size-4 text-destructive" />
								</div>
								<div>
									<h3 className="text-sm font-medium text-destructive">
										Pending Actions Required
									</h3>
									<p className="text-muted-foreground text-sm">
										You have {pendingSummaryCount} invoice
										{pendingSummaryCount !== 1 ? "s" : ""} that require your
										attention.
									</p>
									{pendingListTruncated && (
										<p className="text-muted-foreground mt-1 text-xs">
											Showing the {pendingInvoices.length} most recent below.
										</p>
									)}
								</div>
							</div>

							<div className="space-y-2">
								{pendingListLoading && pendingInvoices.length === 0 ? (
									<p className="text-muted-foreground text-sm">
										Loading pending invoices…
									</p>
								) : (
									pendingInvoices.map((invoice) => (
										<div
											key={invoice.id}
											className="flex items-center justify-between gap-4 rounded border border-destructive/10 bg-background px-4 py-2"
										>
											<div className="space-y-1">
												<div
													className="text-sm font-medium text-foreground"
													title={invoice.id}
												>
													{shortId(invoice.id)}
												</div>
												<div className="text-muted-foreground text-xs font-medium">
													{invoice.period} • {invoice.amount}
												</div>
											</div>
											<div className="flex items-center gap-3">
												<Badge variant={invoiceStatusVariants[invoice.status]}>
													{invoice.status}
												</Badge>
												<Button onClick={() => onViewInvoice(invoice)}>
													<Eye className="size-4" />
													<span className="font-medium">Review</span>
												</Button>
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			<SearchWithFilters
				searchPlaceholder="Search by invoice number..."
				searchValue={searchValue}
				onSearchChange={onSearchChange}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={onFiltersExpandedChange}
				filterConfigs={filterConfigs}
			/>

			<Card className="drop-shadow-none">
				<CardHeader className="border-b">
					<CardTitle className="text-lg font-bold">Invoice History</CardTitle>
				</CardHeader>
				<CardContent>
					<CustomTable
						data={allInvoices}
						columns={columns}
						isLoading={isLoading}
						loadingLabel="Loading invoices..."
					/>
				</CardContent>
			</Card>

			<ConfigPagePagination
				page={page}
				totalPages={totalPages}
				onPageChange={onPageChange}
			/>
		</div>
	);
}
