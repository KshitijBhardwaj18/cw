export type VendorInvoiceStatus = "paid" | "submitted" | "draft";

export interface VendorInvoiceDeductionLine {
	label: string;
	percent: number;
	amount: number;
}

export interface VendorInvoiceBreakdown {
	id: string;
	invoiceId: string;
	dueDate: string;
	dueDateLabel: string;
	organization: string;
	periodStartDate: string;
	periodEndDate: string;
	periodLabel: string;
	status: VendorInvoiceStatus;
	billRate: number;
	hours: number;
	multiplier: number;
	grossAmount: number;
	deductionLines: VendorInvoiceDeductionLine[];
	totalDeductions: number;
	finalAmount: number;
}

export interface VendorInvoiceRow {
	id: string;
	invoiceId: string;
	dueDate: string;
	dueDateLabel: string;
	periodStartDate: string;
	periodEndDate: string;
	periodLabel: string;
	organization: string;
	hours: number;
	grossAmount: number;
	deductions: number;
	finalAmount: number;
	status: VendorInvoiceStatus;
}

export interface VendorInvoiceMetricStats {
	totalCount: number;
	paidAmount: number;
	pendingAmount: number;
	draftAmount: number;
}
