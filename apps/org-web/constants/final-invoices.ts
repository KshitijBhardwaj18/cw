import type { FinalInvoiceStatus } from "@/services/billing.service";

export const FINAL_INVOICE_STATUS_FILTER_OPTIONS = [
	{ value: "all", label: "All Status" },
	{ value: "PAID", label: "Paid" },
	{
		value: "PENDING_PAYMENT",
		label: "Pending Payment",
	},
	{ value: "OVERDUE", label: "Overdue" },
] as const;

export const FINAL_INVOICE_STATUS_LABEL: Record<FinalInvoiceStatus, string> = {
	PAID: "Paid",
	PENDING_PAYMENT: "Pending Payment",
	OVERDUE: "Overdue",
};
