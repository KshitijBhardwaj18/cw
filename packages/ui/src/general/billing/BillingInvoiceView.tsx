"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { CustomTable } from "@repo/ui/general/CustomTable";
import type { ReactNode } from "react";
import { useInvoiceLineItemsColumns } from "./hooks/use-invoice-line-items-columns";
import { InvoiceReviewHeader } from "./InvoiceReviewHeader";
import { InvoiceStatusCard } from "./InvoiceStatusCard";
import { InvoiceSummarySection } from "./InvoiceSummarySection";
import { DisputeInvoiceSheet } from "./sheets/DisputeInvoiceSheet";
import { DisputeLineItemSheet } from "./sheets/DisputeLineItemSheet";
import type { InvoiceDetail, InvoiceLineItem, InvoiceStatus } from "./types";

export interface BillingInvoiceViewProps {
	invoice: InvoiceDetail | null;
	isLoading?: boolean;

	currentStatus: InvoiceStatus;
	hasStatusChanged: boolean;
	isUpdatingStatus: boolean;
	onStatusChange: (status: InvoiceStatus) => void;
	onUpdateStatus: () => void;
	onRevertStatus: () => void;

	onFlagLineItem: (item: InvoiceLineItem) => void;
	onOpenDisputeInvoice: () => void;
	backLink: { href: string; label: string };
	extraActions?: {
		key: string;
		icon: ReactNode;
		label: string;
		onClick: () => void;
		variant?: "outline" | "ghost" | "default";
		disabled?: boolean;
	}[];

	isDisputeOpen: boolean;
	onCloseDisputeLineItem: () => void;
	isDisputeInvoiceOpen: boolean;
	onCloseDisputeInvoice: () => void;
	selectedLineItem: InvoiceLineItem | null;
	onSubmitDisputeLineItem?: (payload: {
		lineItem: InvoiceLineItem;
		reason: string;
		files: File[];
	}) => void | Promise<void>;
	onSubmitDisputeInvoice?: (payload: {
		reason: string;
		files: File[];
	}) => void | Promise<void>;
	isSubmittingDispute?: boolean;

	formatCurrency: (amount: number) => string;
	formatPeriod: (start: string | null, end: string | null) => string;
	canMutateInvoice?: boolean;
}

export function BillingInvoiceView({
	invoice,
	isLoading,
	currentStatus,
	hasStatusChanged,
	isUpdatingStatus,
	onStatusChange,
	onUpdateStatus,
	onRevertStatus,
	onFlagLineItem,
	onOpenDisputeInvoice,
	backLink,
	extraActions,
	isDisputeOpen,
	onCloseDisputeLineItem,
	isDisputeInvoiceOpen,
	onCloseDisputeInvoice,
	selectedLineItem,
	onSubmitDisputeLineItem,
	onSubmitDisputeInvoice,
	isSubmittingDispute = false,
	formatCurrency,
	formatPeriod,
	canMutateInvoice = true,
}: Readonly<BillingInvoiceViewProps>) {
	const { columns } = useInvoiceLineItemsColumns({
		onFlagItem: onFlagLineItem,
		formatCurrency,
		flagActionEnabled: canMutateInvoice,
	});

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-10 w-1/2" />
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!invoice) return null;

	const lineItems = invoice.lineItems ?? [];
	const periodLabel = formatPeriod(
		invoice.periodStartDate,
		invoice.periodEndDate,
	);

	return (
		<div className="space-y-6">
			<InvoiceReviewHeader
				invoiceNumber={invoice.invoiceNumber}
				period={periodLabel}
				lineItemCount={lineItems.length}
				showDisputeAction={canMutateInvoice}
				onOpenDispute={onOpenDisputeInvoice}
				disputeActionDisabled={isSubmittingDispute}
				backLink={backLink}
				extraActions={extraActions}
			/>

			<InvoiceStatusCard
				currentStatus={currentStatus}
				hasStatusChanged={hasStatusChanged}
				isUpdatingStatus={isUpdatingStatus}
				onStatusChange={onStatusChange}
				onUpdateStatus={onUpdateStatus}
				onRevertStatus={onRevertStatus}
				readOnly={!canMutateInvoice}
			/>

			<Card>
				<CardHeader className="border-b">
					<CardTitle className="text-lg">Line Item Details</CardTitle>
					<CardDescription>
						{canMutateInvoice
							? "Review each line item and flag any discrepancies for dispute"
							: "Line items for this invoice (view only)."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CustomTable data={lineItems} columns={columns} />
				</CardContent>
			</Card>

			<InvoiceSummarySection
				invoice={invoice}
				formatCurrency={formatCurrency}
			/>

			{canMutateInvoice ? (
				<>
					<DisputeLineItemSheet
						isOpen={isDisputeOpen}
						onClose={onCloseDisputeLineItem}
						lineItem={selectedLineItem}
						onSubmit={onSubmitDisputeLineItem}
						isSubmitting={isSubmittingDispute}
					/>

					<DisputeInvoiceSheet
						isOpen={isDisputeInvoiceOpen}
						onClose={onCloseDisputeInvoice}
						invoiceId={invoice.invoiceNumber}
						onSubmit={onSubmitDisputeInvoice}
						isSubmitting={isSubmittingDispute}
					/>
				</>
			) : null}
		</div>
	);
}
