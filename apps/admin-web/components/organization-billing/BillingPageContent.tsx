"use client";

import type { BillingTab } from "@repo/casl";
import { formatUsdLedgerNullable } from "@repo/shared";
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
import {
	type ConfigPageAction,
	ConfigPageHeader,
} from "@repo/ui/general/ConfigPageHeader";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { DollarSign, FileText, Pencil, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useBillingAbilities } from "@/hooks/use-billing-abilities";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import {
	useBillingConfig,
	useInvoices,
	usePayCodes,
	usePendingInvoiceCount,
} from "@/queries/organization-billing.queries";
import { useHolidays } from "@/queries/organization-timekeeping.queries";
import { OrganizationBillingService } from "@/services/organization-billing.service";
import { EditBillingSettingsDialog } from "./EditBillingSettingsDialog";
import RatesTabContent from "./RatesTabContent";

const PAGE_SIZE = 10;
export const INV_PARAMS = {
	PAGE: "invPage",
	LIMIT: "invLimit",
	SEARCH: "invSearch",
	STATUS: "status",
} as const;

/** Pending-attention list (Draft + Submitted); separate from paginated history table. */
const PENDING_ATTENTION_LIMIT = 50;

function toHistoryItem(
	inv: ApiInvoiceListItem,
	fmtPeriod: (
		s: string | null | undefined,
		e: string | null | undefined,
	) => string,
	fmtShortDate: (iso: string | null | undefined) => string,
): InvoiceHistoryItem {
	return {
		id: inv.invoiceNumber,
		_id: inv.id,
		period: fmtPeriod(inv.periodStartDate, inv.periodEndDate),
		amount: formatUsdLedgerNullable(inv.totalAmount),
		dueDate: fmtShortDate(inv.dueDate),
		status: statusMap[inv.status] ?? "Draft",
		lineItems: inv.lineItemCount,
	};
}

interface BillingPageContentProps {
	organizationId: string;
}

function BillingPageContent({
	organizationId,
}: Readonly<BillingPageContentProps>) {
	const router = useRouter();
	const orgId = organizationId;
	const { fmtPeriod, fmtShortDate } = useUserTimezone();
	const {
		allowedTabs,
		visibleConfigSections,
		canUpdateBillingConfig,
		canUpdateConfigSection,
		canReadInvoiceHistory,
		canReadRatesTab,
		canReadBillingConfigurationTab,
	} = useBillingAbilities();
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

	const [tab, setTab] = useTabSwitch(
		allowedTabs.length > 0 ? allowedTabs : (["billing-configuration"] as const),
		{
			alsoClearParamKeys: [
				INV_PARAMS.STATUS,
				INV_PARAMS.SEARCH,
				INV_PARAMS.PAGE,
			],
		},
	);

	useEffect(() => {
		if (allowedTabs.length === 0) return;
		if (!allowedTabs.includes(tab as BillingTab)) {
			setTab(allowedTabs[0]);
		}
	}, [allowedTabs, tab, setTab]);

	const {
		searchValue: invSearchValue,
		handleSearchChange: handleInvSearchChange,
		filterConfigs,
		searchFromUrl: invSearchFromUrl,
		values,
	} = useSearchWithFilters({
		search: { paramKey: INV_PARAMS.SEARCH },
		pagination: { pageParamKey: INV_PARAMS.PAGE },
		filters: [
			{
				id: INV_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
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
		],
	});

	const {
		page: invPage,
		limit: invLimit,
		setPage: setInvPage,
	} = usePaginationControls({
		pageParamKey: INV_PARAMS.PAGE,
		limitParamKey: INV_PARAMS.LIMIT,
		defaultLimit: PAGE_SIZE,
	});

	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const { data: pendingCount = 0 } = usePendingInvoiceCount(orgId, {
		enabled: canReadInvoiceHistory,
	});

	const {
		data: invoicesData,
		isLoading: invoicesLoading,
		isFetching: invoicesFetching,
	} = useInvoices(
		orgId,
		{
			search: invSearchFromUrl || undefined,
			status:
				values[INV_PARAMS.STATUS] === "all"
					? undefined
					: values[INV_PARAMS.STATUS],
			page: invPage,
			limit: invLimit,
		},
		{ enabled: canReadInvoiceHistory },
	);

	const { data: pendingListData, isLoading: pendingListLoading } = useInvoices(
		orgId,
		{
			status: "PENDING",
			page: 1,
			limit: PENDING_ATTENTION_LIMIT,
		},
		{ enabled: canReadInvoiceHistory },
	);

	const allInvoices = useMemo(
		() =>
			(invoicesData?.data ?? []).map((inv) =>
				toHistoryItem(inv, fmtPeriod, fmtShortDate),
			),
		[invoicesData?.data, fmtPeriod, fmtShortDate],
	);
	const totalPages = invoicesData?.totalPages ?? 1;

	const pendingInvoices = useMemo(
		() =>
			(pendingListData?.data ?? []).map((inv) =>
				toHistoryItem(inv, fmtPeriod, fmtShortDate),
			),
		[pendingListData?.data, fmtPeriod, fmtShortDate],
	);

	const handleViewInvoice = (invoice: InvoiceHistoryItem) => {
		const id =
			(invoice as InvoiceHistoryItem & { _id?: string })._id ?? invoice.id;
		router.push(
			`/organizations/${organizationId}/time-financials/billing/${id}`,
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

	const canEditSettings =
		canUpdateBillingConfig &&
		visibleConfigSections.some((section) => canUpdateConfigSection(section));

	const headerActions = canEditSettings
		? ([
				{
					key: "edit-settings",
					icon: <Pencil className="mr-2 h-4 w-4" />,
					label: "Edit Settings",
					variant: "outline" as const,
					onClick: () => setIsEditDialogOpen(true),
				},
			] satisfies ConfigPageAction[])
		: [];

	return (
		<>
			<div className="space-y-6">
				<ConfigPageHeader
					title="Billing & Financial Management"
					total={pendingCount}
					itemLabel="Pending Invoice"
					itemLabelPlural="Pending Invoices"
					description="Configure your organization's billing preferences and track all financial transactions"
					actions={headerActions}
				/>

				<Tabs
					value={tab}
					onValueChange={setTab}
					className="w-full flex-col space-y-6"
				>
					<ScrollableLineTabsRow>
						<TabsList
							variant="line"
							className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
						>
							{canReadBillingConfigurationTab && (
								<TabsTrigger
									value="billing-configuration"
									className="flex-none py-3 px-4"
								>
									<Settings className="size-4" />
									Billing Configuration
								</TabsTrigger>
							)}

							{canReadInvoiceHistory && (
								<TabsTrigger
									value="invoice-history"
									className="relative flex-none py-3 px-4"
								>
									<FileText className="size-4" />
									Invoice History
									{pendingCount > 0 && (
										<span className="bg-destructive text-destructive-foreground ml-2 inline-flex size-5 items-center justify-center rounded-full text-xs font-semibold">
											{pendingCount}
										</span>
									)}
								</TabsTrigger>
							)}

							{canReadRatesTab && (
								<TabsTrigger value="rates" className="flex-none py-3 px-4">
									<DollarSign className="size-4" />
									Rates
								</TabsTrigger>
							)}
						</TabsList>
					</ScrollableLineTabsRow>

					{canReadBillingConfigurationTab && (
						<TabsContent value="billing-configuration" className="mt-0">
							<BillingConfigTabContent
								config={config}
								payCodes={payCodesData?.data ?? []}
								holidays={holidaysData?.data ?? []}
								isLoading={configLoading}
								payCodesLoading={payCodesLoading}
								holidaysLoading={holidaysLoading}
								visibleSections={visibleConfigSections}
							/>
						</TabsContent>
					)}

					{canReadInvoiceHistory && (
						<TabsContent value="invoice-history" className="mt-0">
							<InvoiceHistoryTabContent
								allInvoices={allInvoices}
								pendingInvoices={pendingInvoices}
								pendingAttentionTotal={pendingCount}
								pendingListLoading={pendingListLoading}
								searchValue={invSearchValue}
								onSearchChange={handleInvSearchChange}
								filtersExpanded={filtersExpanded}
								onFiltersExpandedChange={setFiltersExpanded}
								filterConfigs={filterConfigs}
								page={invPage}
								totalPages={totalPages}
								onPageChange={setInvPage}
								onViewInvoice={handleViewInvoice}
								isLoading={invoicesLoading || invoicesFetching}
								onDownloadPDF={async (inv) => {
									try {
										const id =
											(inv as InvoiceHistoryItem & { _id?: string })._id ??
											inv.id;
										const blob =
											await OrganizationBillingService.downloadInvoicePdf(
												organizationId,
												id,
											);
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
										const blob =
											await OrganizationBillingService.downloadInvoiceCsv(
												organizationId,
												id,
											);
										await downloadBlob(blob, `${inv.id}.csv`);
									} catch (err) {
										toast.error(
											err instanceof Error
												? err.message
												: "Failed to export CSV",
										);
									}
								}}
							/>
						</TabsContent>
					)}

					{canReadRatesTab && (
						<TabsContent value="rates" className="mt-0">
							<RatesTabContent organizationId={organizationId} />
						</TabsContent>
					)}
				</Tabs>
			</div>
			<EditBillingSettingsDialog
				organizationId={organizationId}
				isOpen={isEditDialogOpen}
				onClose={() => setIsEditDialogOpen(false)}
			/>
		</>
	);
}

export default BillingPageContent;
