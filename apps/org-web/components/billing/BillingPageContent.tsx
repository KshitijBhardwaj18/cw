"use client";

import { Action, useAbility } from "@repo/casl";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { BillingConfigTabContent } from "@repo/ui/general/billing/BillingConfigTabContent";
import { InvoiceHistoryTabContent } from "@repo/ui/general/billing/InvoiceHistoryTabContent";
import type {
	InvoiceListItem as ApiInvoiceListItem,
	InvoiceHistoryItem,
} from "@repo/ui/general/billing/types";
import { DB_TO_UI_STATUS as statusMap } from "@repo/ui/general/billing/types";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { FileText, Pencil, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrgContext } from "@/contexts/org-context";
import {
	useBillingConfig,
	useInvoiceHistory,
	useInvoiceHistoryPendingCount,
	usePayCodes,
} from "@/queries/billing.queries";
import { useHolidays } from "@/queries/timekeeping.queries";
import { BillingService } from "@/services/billing.service";
import { fmtCurrency, fmtPeriod, fmtShortDate } from "@/utils/format";
import { EditBillingSettingsDialog } from "./EditBillingSettingsDialog";

const PAGE_SIZE = 10;
const PENDING_ATTENTION_LIMIT = 50;

function toHistoryItem(inv: ApiInvoiceListItem): InvoiceHistoryItem {
	return {
		id: inv.invoiceNumber,
		_id: inv.id,
		period: fmtPeriod(inv.periodStartDate, inv.periodEndDate),
		amount: fmtCurrency(inv.totalAmount),
		dueDate: fmtShortDate(inv.dueDate),
		status: statusMap[inv.status] ?? "Draft",
		lineItems: inv.lineItemCount,
	};
}

function BillingPageContent() {
	const ability = useAbility();
	const canEditBillingSettings = ability.can(Action.Update, "Billing");

	const router = useRouter();
	const { id: orgId } = useOrgContext();
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

	const { data: config, isLoading: configLoading } = useBillingConfig(orgId);
	const { data: payCodesData, isLoading: payCodesLoading } = usePayCodes(
		orgId,
		{ limit: 100 },
	);
	const { data: holidaysData, isLoading: holidaysLoading } = useHolidays(
		orgId,
		{ year: new Date().getFullYear(), limit: 50 },
	);

	const [searchValue, setSearchValue] = useState("");
	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const [statusFilter, setStatusFilter] = useState("all");
	const [page, setPage] = useState(1);
	const { data: pendingCount = 0 } = useInvoiceHistoryPendingCount(orgId);

	const { data: invoicesData } = useInvoiceHistory(orgId, {
		search: searchValue || undefined,
		status: statusFilter === "all" ? undefined : statusFilter,
		page,
		limit: PAGE_SIZE,
	});

	const { data: pendingListData, isLoading: pendingListLoading } =
		useInvoiceHistory(orgId, {
			status: "PENDING",
			page: 1,
			limit: PENDING_ATTENTION_LIMIT,
		});

	const allInvoices = useMemo(
		() => (invoicesData?.data ?? []).map(toHistoryItem),
		[invoicesData?.data],
	);
	const totalPages = invoicesData?.totalPages ?? 1;

	const pendingInvoices = useMemo(
		() => (pendingListData?.data ?? []).map(toHistoryItem),
		[pendingListData?.data],
	);

	const handleViewInvoice = (invoice: InvoiceHistoryItem) => {
		router.push(
			`/org/billing/${(invoice as InvoiceHistoryItem & { _id?: string })._id ?? invoice.id}`,
		);
	};

	const downloadBlob = async (blob: Blob, filename: string): Promise<void> => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	const filterConfigs = [
		{
			id: "status",
			label: "Status",
			value: statusFilter,
			onValueChange: (v: string) => {
				setStatusFilter(v);
				setPage(1);
			},
			options: [
				{ value: "all", label: "All Statuses" },
				{ value: "DRAFT", label: "Draft" },
				{ value: "SUBMITTED", label: "Pending Approval" },
				{ value: "DISPUTED", label: "Disputed" },
				{ value: "APPROVED", label: "Finalized" },
				{ value: "PAID", label: "Paid" },
				{ value: "OVERDUE", label: "Overdue" },
			],
		},
	];

	return (
		<>
			<div className="space-y-6">
				<ConfigPageHeader
					title="Billing & Financial Management"
					total={pendingCount}
					itemLabel="Pending Invoice"
					itemLabelPlural="Pending Invoices"
					description="Configure your organization's billing preferences and track all financial transactions"
					actions={
						canEditBillingSettings
							? [
									{
										key: "edit-settings",
										icon: <Pencil className="mr-2 h-4 w-4" />,
										label: "Edit Settings",
										variant: "outline",
										onClick: () => setIsEditDialogOpen(true),
									},
								]
							: []
					}
				/>

				<Tabs
					defaultValue="billing-configuration"
					className="w-full flex-col space-y-6"
				>
					<ScrollableLineTabsRow>
						<TabsList
							variant="line"
							className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
						>
							<TabsTrigger
								value="billing-configuration"
								className="flex-none py-3 px-4"
							>
								<Settings className="size-4" />
								Billing Configuration
							</TabsTrigger>

							<TabsTrigger
								value="invoice-history"
								className="relative flex-none py-3 px-4"
							>
								<FileText className="size-4" />
								Invoice History
								{pendingCount > 0 && (
									<span className="bg-destructive text-destructive-foreground inline-flex size-5 items-center justify-center rounded-full text-xs font-semibold ml-2">
										{pendingCount}
									</span>
								)}
							</TabsTrigger>
						</TabsList>
					</ScrollableLineTabsRow>

					<TabsContent value="billing-configuration" className="mt-0">
						<BillingConfigTabContent
							config={config}
							payCodes={payCodesData?.data ?? []}
							holidays={holidaysData?.data ?? []}
							isLoading={configLoading}
							payCodesLoading={payCodesLoading}
							holidaysLoading={holidaysLoading}
						/>
					</TabsContent>

					<TabsContent value="invoice-history" className="mt-0">
						<InvoiceHistoryTabContent
							allInvoices={allInvoices}
							pendingInvoices={pendingInvoices}
							pendingAttentionTotal={pendingCount}
							pendingListLoading={pendingListLoading}
							searchValue={searchValue}
							onSearchChange={(v) => {
								setSearchValue(v);
								setPage(1);
							}}
							filtersExpanded={filtersExpanded}
							onFiltersExpandedChange={setFiltersExpanded}
							filterConfigs={filterConfigs}
							page={page}
							totalPages={totalPages}
							onPageChange={setPage}
							onViewInvoice={handleViewInvoice}
							onDownloadPDF={async (inv) => {
								try {
									const id =
										(inv as InvoiceHistoryItem & { _id?: string })._id ??
										inv.id;
									const blob = await BillingService.downloadInvoicePdf(id);
									await downloadBlob(blob, `${inv.id}.pdf`);
								} catch (err) {
									toast.error(
										err instanceof Error
											? err.message
											: "Failed to download PDF",
									);
								}
							}}
							onExportData={async (inv) => {
								try {
									const id =
										(inv as InvoiceHistoryItem & { _id?: string })._id ??
										inv.id;
									const blob = await BillingService.downloadInvoiceCsv(id);
									await downloadBlob(blob, `${inv.id}.csv`);
								} catch (err) {
									toast.error(
										err instanceof Error ? err.message : "Failed to export CSV",
									);
								}
							}}
						/>
					</TabsContent>
				</Tabs>
			</div>
			<EditBillingSettingsDialog
				isOpen={isEditDialogOpen}
				onClose={() => setIsEditDialogOpen(false)}
			/>
		</>
	);
}

export default BillingPageContent;
