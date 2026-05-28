"use client";

import { Action, useAbility } from "@repo/casl";
import { formatUsdLedgerNullable } from "@repo/shared";
import { BillingInvoiceView } from "@repo/ui/general/billing/BillingInvoiceView";
import type {
	InvoiceDetail,
	InvoiceLineItem,
	InvoiceStatus,
} from "@repo/ui/general/billing/types";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useBillingInvoice } from "@/hooks/use-billing-invoice";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import { BillingService } from "@/services/billing.service";

export default function BillingInvoicePageContent() {
	const ability = useAbility();
	const { fmtPeriod } = useUserTimezone();
	const canMutateInvoice = ability.can(Action.Update, "Invoice");

	const {
		invoice,
		isLoading,
		currentStatus,
		hasStatusChanged,
		isUpdatingStatus,
		isSubmittingDispute,
		onFlagItem,
		isDisputeOpen,
		isDisputeInvoiceOpen,
		selectedLineItem,
		handleStatusChange,
		handleUpdateStatus,
		revertStatus,
		closeDisputeLineItem,
		closeDisputeInvoice,
		openDisputeInvoice,
		submitLineItemDispute,
		submitInvoiceDispute,
	} = useBillingInvoice();
	const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
	const [isDownloadingCsv, setIsDownloadingCsv] = useState(false);

	const downloadBlob = (blob: Blob, filename: string) => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	return (
		<BillingInvoiceView
			canMutateInvoice={canMutateInvoice}
			invoice={invoice as InvoiceDetail | null}
			isLoading={isLoading}
			currentStatus={currentStatus as InvoiceStatus}
			hasStatusChanged={hasStatusChanged}
			isUpdatingStatus={isUpdatingStatus}
			onStatusChange={handleStatusChange}
			onUpdateStatus={handleUpdateStatus}
			onRevertStatus={revertStatus}
			onFlagLineItem={onFlagItem as (item: InvoiceLineItem) => void}
			onOpenDisputeInvoice={openDisputeInvoice}
			extraActions={[
				{
					key: "download-pdf",
					icon: <Download className="size-4" />,
					label: "Download PDF",
					variant: "outline",
					disabled: isDownloadingPdf,
					onClick: () => {
						if (!invoice || isDownloadingPdf) return;
						void (async () => {
							try {
								setIsDownloadingPdf(true);
								const blob = await BillingService.downloadInvoicePdf(
									invoice.id,
								);
								downloadBlob(blob, `${invoice.invoiceNumber}.pdf`);
							} catch (err) {
								toast.error(
									err instanceof Error ? err.message : "Failed to download PDF",
								);
							} finally {
								setIsDownloadingPdf(false);
							}
						})();
					},
				},
				{
					key: "download-csv",
					icon: <FileText className="size-4" />,
					label: "Download CSV",
					variant: "outline",
					disabled: isDownloadingCsv,
					onClick: () => {
						if (!invoice || isDownloadingCsv) return;
						void (async () => {
							try {
								setIsDownloadingCsv(true);
								const blob = await BillingService.downloadInvoiceCsv(
									invoice.id,
								);
								downloadBlob(blob, `${invoice.invoiceNumber}.csv`);
							} catch (err) {
								toast.error(
									err instanceof Error ? err.message : "Failed to download CSV",
								);
							} finally {
								setIsDownloadingCsv(false);
							}
						})();
					},
				},
			]}
			backLink={{ href: "/org/billing", label: "Back to Invoices" }}
			isDisputeOpen={isDisputeOpen}
			onCloseDisputeLineItem={closeDisputeLineItem}
			isDisputeInvoiceOpen={isDisputeInvoiceOpen}
			onCloseDisputeInvoice={closeDisputeInvoice}
			selectedLineItem={selectedLineItem as InvoiceLineItem | null}
			onSubmitDisputeLineItem={submitLineItemDispute}
			onSubmitDisputeInvoice={submitInvoiceDispute}
			isSubmittingDispute={isSubmittingDispute}
			formatCurrency={formatUsdLedgerNullable}
			formatPeriod={fmtPeriod}
		/>
	);
}
