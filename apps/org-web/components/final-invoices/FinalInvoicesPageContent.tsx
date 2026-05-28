"use client";

import { Action, useAbility } from "@repo/casl";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useFinalInvoiceListColumns } from "@/hooks/tables/use-final-invoice-list-columns";
import { useFinalInvoicesPage } from "@/hooks/use-final-invoices-page";
import type { FinalInvoiceListRow } from "@/services/billing.service";
import { BillingService } from "@/services/billing.service";
import { FinalInvoicesMetricCards } from "./FinalInvoicesMetricCards";
import { RouteInvoiceDialog } from "./RouteInvoiceDialog";

export function FinalInvoicesPageContent() {
	const ability = useAbility();
	const canRouteInvoice = ability.can(Action.Update, "Invoice");
	const router = useRouter();

	const {
		localSearch,
		handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		limit,
		setLimit,
		pageSizeOptions,
		listQuery,
		summaryQuery,
		filterConfigs,
	} = useFinalInvoicesPage();

	const [routeOpen, setRouteOpen] = useState(false);
	const [routeInvoice, setRouteInvoice] = useState<FinalInvoiceListRow | null>(
		null,
	);

	const rows = listQuery.data?.data ?? [];
	const totalFiltered = listQuery.data?.total ?? 0;
	const pageCount = Math.ceil(totalFiltered / limit) || 1;

	const onView = useCallback(
		(row: (typeof rows)[number]) => {
			router.push(`/org/final-invoices/${row.id}`);
		},
		[router],
	);

	const onRoute = useCallback((row: (typeof rows)[number]) => {
		setRouteInvoice(row);
		setRouteOpen(true);
	}, []);

	const onDownload = useCallback((row: (typeof rows)[number]) => {
		void (async () => {
			try {
				const blob = await BillingService.downloadInvoicePdf(row.id);
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${row.invoiceNumber}.pdf`;
				document.body.appendChild(a);
				a.click();
				a.remove();
				URL.revokeObjectURL(url);
				toast.success("Download started", {
					description: `Preparing ${row.invoiceNumber}.`,
				});
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Failed to download PDF",
				);
			}
		})();
	}, []);

	const columns = useFinalInvoiceListColumns({
		onView,
		onRoute,
		onDownload,
		canRoute: canRouteInvoice,
	});

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Final Invoices"
				total={totalFiltered}
				itemLabel="invoice"
				itemLabelPlural="invoices"
				description="View and download finalized invoices"
			/>

			<FinalInvoicesMetricCards summary={summaryQuery.data} />

			<SearchWithFilters
				searchPlaceholder="Search by invoice number or vendor..."
				searchValue={localSearch}
				onSearchChange={handleSearchChange}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			{!listQuery.isLoading && totalFiltered === 0 ? (
				<ConfigPageEmptyState
					hasSearch={localSearch.trim() !== ""}
					emptyTitle="No invoices in this view"
					emptyMessage="Try clearing search or changing the status filter."
					icon={FileText}
				/>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg font-semibold">
							All Final Invoices
						</CardTitle>
						<CardDescription>Sorted by most recent first</CardDescription>
					</CardHeader>
					<CardContent>
						<CustomTable
							data={rows}
							columns={columns}
							enableSorting
							enablePagination={false}
							isLoading={listQuery.isLoading}
							loadingLabel="Loading final invoices..."
							className="rounded-none border-0 border-b-0"
						/>
						<PaginationControls
							currentPage={page}
							pageCount={pageCount}
							goToPage={setPage}
							limit={limit}
							setLimit={setLimit}
							pageSizeOptions={pageSizeOptions}
							totalItems={totalFiltered}
							itemLabel="invoice"
							itemLabelPlural="invoices"
						/>
					</CardContent>
				</Card>
			)}

			<RouteInvoiceDialog
				open={routeOpen}
				onOpenChange={setRouteOpen}
				invoice={routeInvoice}
			/>
		</div>
	);
}
