import { formatUtcPeriod, formatUtcShortDate } from "@repo/shared";
import type { InvoiceDetail } from "@repo/ui/general/billing/types";
import type { InvoiceDraftStatus } from "./invoice-drafts";

export type InvoiceDraftDetailFormatters = {
	fmtShortDate: (iso: string | null | undefined) => string;
	fmtPeriod: (
		start: string | null | undefined,
		end: string | null | undefined,
	) => string;
};

export type InvoiceDraftDetailTab = "all" | "approved" | "disputed";

export interface InvoiceDraftDetailLineItem {
	id: string;
	timeEntryId?: string;
	disputeReason?: string;
	locationName: string;
	dateLabel: string;
	workerName: string;
	workerSubtitle: string;
	payCode: string;
	hours: number;
	rate: number;
	amount: number;
	disputed: boolean;
	disputedAmount: number;
}

export interface InvoiceDraftDetailMock {
	id: string;
	invoiceNumber: string;
	status: InvoiceDraftStatus;
	vendor: string;
	periodLabel: string;
	pageSubtitle: string;
	/** Non-disputed total for the invoice period (summary metric). */
	totalAmountForPeriod: number;
	totalWorkers: number;
	totalHours: number;
	approvedAmount: number;
	disputedAmount: number;
	approvedItemCount: number;
	disputedItemCount: number;
	totalLineItemCount: number;
	lineItems: InvoiceDraftDetailLineItem[];
}

export interface InvoiceDraftDateGroup {
	dateLabel: string;
	dateHours: number;
	dateAmount: number;
	items: InvoiceDraftDetailLineItem[];
}

export interface InvoiceDraftLocationGroup {
	locationName: string;
	dateGroups: InvoiceDraftDateGroup[];
}

function toDraftStatus(detail: InvoiceDetail): InvoiceDraftStatus {
	if (detail.draftSummary?.status) return detail.draftSummary.status;
	const disputedAmount =
		detail.lineItems?.reduce(
			(sum, li) => sum + Number(li.disputedAmount ?? 0),
			0,
		) ?? 0;
	if (disputedAmount > 0) return "PARTIALLY_DISPUTED";
	return "READY_FOR_REVIEW";
}

export function toInvoiceDraftDetail(
	detail: InvoiceDetail,
	formatters?: InvoiceDraftDetailFormatters,
): InvoiceDraftDetailMock {
	const fmtS = formatters?.fmtShortDate ?? formatUtcShortDate;
	const fmtP = formatters?.fmtPeriod ?? formatUtcPeriod;

	const lineItems: InvoiceDraftDetailLineItem[] = (detail.lineItems ?? []).map(
		(li) => {
			const disputedAmount = Number(li.disputedAmount ?? 0);
			const disputed = Boolean(li.isDisputed || disputedAmount > 0);
			return {
				id: li.id,
				timeEntryId: li.timeEntryId,
				disputeReason: li.disputeReason,
				locationName: li.locationName || "Main location",
				dateLabel: li.workDate
					? fmtS(li.workDate)
					: fmtP(li.periodStart ?? undefined, li.periodEnd ?? undefined) || "—",
				workerName: li.candidateName || li.description || "Unknown worker",
				workerSubtitle: li.lineType || "—",
				payCode: li.payCode || "Regular",
				hours: Number(li.quantity ?? 0),
				rate: Number(li.unitPrice ?? 0),
				amount: Number(li.amount ?? 0),
				disputed,
				disputedAmount,
			};
		},
	);

	const approvedItems = lineItems.filter((i) => !i.disputed);
	const disputedItems = lineItems.filter((i) => i.disputed);
	const summary = detail.draftSummary;
	const approvedAmount =
		summary?.approvedAmount ??
		approvedItems.reduce((sum, i) => sum + i.amount, 0);
	const disputedAmount =
		summary?.disputedAmount ??
		disputedItems.reduce((sum, i) => sum + (i.disputedAmount || i.amount), 0);

	return {
		id: detail.id,
		invoiceNumber: detail.invoiceNumber,
		status: toDraftStatus(detail),
		vendor: detail.vendor?.name ?? "—",
		periodLabel: fmtP(
			detail.periodStartDate ?? undefined,
			detail.periodEndDate ?? undefined,
		),
		pageSubtitle: "Review line items sourced from approved timekeeping",
		totalAmountForPeriod: summary?.totalAmountForPeriod ?? approvedAmount,
		totalWorkers:
			summary?.totalWorkers ??
			new Set(approvedItems.map((i) => i.workerName)).size,
		totalHours:
			summary?.totalHours ?? approvedItems.reduce((sum, i) => sum + i.hours, 0),
		approvedAmount,
		disputedAmount,
		approvedItemCount: summary?.approvedItemCount ?? approvedItems.length,
		disputedItemCount: summary?.disputedItemCount ?? disputedItems.length,
		totalLineItemCount: summary?.totalLineItemCount ?? lineItems.length,
		lineItems,
	};
}

export function filterDetailLineItems(
	items: InvoiceDraftDetailLineItem[],
	tab: InvoiceDraftDetailTab,
): InvoiceDraftDetailLineItem[] {
	if (tab === "all") return items;
	if (tab === "approved") return items.filter((i) => !i.disputed);
	return items.filter((i) => i.disputed);
}

export function groupDetailLineItems(
	items: InvoiceDraftDetailLineItem[],
): InvoiceDraftLocationGroup[] {
	const locationOrder: string[] = [];
	const byLoc = new Map<string, Map<string, InvoiceDraftDetailLineItem[]>>();

	for (const item of items) {
		if (!byLoc.has(item.locationName)) {
			byLoc.set(item.locationName, new Map());
			locationOrder.push(item.locationName);
		}
		const dates = byLoc.get(item.locationName);
		if (!dates) continue;
		if (!dates.has(item.dateLabel)) {
			dates.set(item.dateLabel, []);
		}
		const bucket = dates.get(item.dateLabel);
		if (bucket) bucket.push(item);
	}

	return locationOrder.map((locationName) => {
		const dates = byLoc.get(locationName);
		if (!dates) {
			return { locationName, dateGroups: [] };
		}
		const dateLabels = Array.from(dates.keys());
		const dateGroups: InvoiceDraftDateGroup[] = dateLabels.map((dateLabel) => {
			const rowItems = dates.get(dateLabel) ?? [];
			const dateHours = rowItems.reduce((s, r) => s + r.hours, 0);
			const dateAmount = rowItems.reduce((s, r) => s + r.amount, 0);
			return { dateLabel, items: rowItems, dateHours, dateAmount };
		});
		return { locationName, dateGroups };
	});
}
