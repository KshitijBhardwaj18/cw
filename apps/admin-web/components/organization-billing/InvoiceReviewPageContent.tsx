"use client";

import { formatUsdLedgerNullable } from "@repo/shared";
import { BillingInvoiceView } from "@repo/ui/general/billing/BillingInvoiceView";
import type {
	InvoiceDetail,
	InvoiceLineItem,
	InvoiceStatus,
} from "@repo/ui/general/billing/types";
import { Download, FileText } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useOrganizationBillingInvoice } from "@/hooks/use-organization-billing-invoice";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import { OrganizationBillingService } from "@/services/organization-billing.service";

export default function InvoiceReviewPageContent() {
	const params = useParams();
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
	} = useOrganizationBillingInvoice();
	const { fmtPeriod } = useUserTimezone();
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
								const blob =
									await OrganizationBillingService.downloadInvoicePdf(
										String(params.organizationId),
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
								const blob =
									await OrganizationBillingService.downloadInvoiceCsv(
										String(params.organizationId),
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
			backLink={{
				href: `/organizations/${params.organizationId}/time-financials/billing`,
				label: "Back to Invoices",
			}}
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
