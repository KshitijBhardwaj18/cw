"use client";

import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useVendorInvoiceListColumns } from "@/hooks/tables/use-vendor-invoice-list-columns";
import { useVendorInvoicesPage } from "@/hooks/use-vendor-invoices-page";
import { VendorInvoicesService } from "@/services/vendor-invoices.service";
import type { VendorInvoiceRow } from "@/types/vendor-invoices";
import { InvoiceBreakdownDialog } from "./InvoiceBreakdownDialog";
import { InvoicesMetricCards } from "./InvoicesMetricCards";

export function InvoicesPageContent() {
	const {
		search,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		query,
		listQuery,
		summaryQuery,
		filterConfigs,
	} = useVendorInvoicesPage();

	const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<
		string | null
	>(null);
	const [breakdownInvoice, setBreakdownInvoice] =
		useState<VendorInvoiceRow | null>(null);

	const rows = listQuery.data?.data ?? [];
	const total = listQuery.data?.total ?? 0;

	const handleBreakdown = useCallback((row: VendorInvoiceRow) => {
		setBreakdownInvoice(row);
	}, []);

	const handleDownload = useCallback(
		async (row: VendorInvoiceRow) => {
			if (downloadingInvoiceId) return;
			try {
				setDownloadingInvoiceId(row.id);
				const blob = await VendorInvoicesService.downloadInvoicePdf(row.id);
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${row.invoiceId}.pdf`;
				document.body.appendChild(a);
				a.click();
				a.remove();
				URL.revokeObjectURL(url);
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to download invoice PDF",
				);
			} finally {
				setDownloadingInvoiceId(null);
			}
		},
		[downloadingInvoiceId],
	);

	const columns = useVendorInvoiceListColumns({
		onBreakdown: handleBreakdown,
		onDownload: handleDownload,
		downloadingInvoiceId,
	});

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Invoices"
				total={total}
				itemLabel="invoice"
				itemLabelPlural="invoices"
				description="Review reverse invoices and payment calculations"
			/>

			<InvoicesMetricCards stats={summaryQuery.data} />

			<SearchWithFilters
				searchPlaceholder="Search by invoice number..."
				searchValue={search}
				onSearchChange={setSearch}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			<CustomTable
				data={rows}
				columns={columns}
				enableSorting
				enablePagination
				paginationMode="server"
				totalCount={total}
				pageSize={query.limit}
				currentPage={page}
				onPaginationChange={(nextPage) => setPage(nextPage)}
				emptyState={null}
			/>

			<InvoiceBreakdownDialog
				open={breakdownInvoice !== null}
				invoice={breakdownInvoice}
				onOpenChange={(open) => {
					if (!open) {
						setBreakdownInvoice(null);
					}
				}}
			/>
		</div>
	);
}

export default InvoicesPageContent;
