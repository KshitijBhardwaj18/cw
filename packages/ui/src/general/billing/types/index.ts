export type InvoiceStatus =
	| "Draft"
	| "Pending Approval"
	| "Disputed"
	| "Finalized"
	| "Paid"
	| "Overdue";

export type DbInvoiceStatus =
	| "DRAFT"
	| "SUBMITTED"
	| "DISPUTED"
	| "APPROVED"
	| "SENT"
	| "PAID"
	| "OVERDUE"
	| "CANCELLED";

export const DB_TO_UI_STATUS: Record<DbInvoiceStatus, InvoiceStatus> = {
	DRAFT: "Draft",
	SUBMITTED: "Pending Approval",
	DISPUTED: "Disputed",
	APPROVED: "Finalized",
	SENT: "Finalized",
	PAID: "Paid",
	OVERDUE: "Overdue",
	CANCELLED: "Draft",
};

export const UI_TO_DB_STATUS: Record<InvoiceStatus, DbInvoiceStatus> = {
	Draft: "DRAFT",
	"Pending Approval": "SUBMITTED",
	Disputed: "DISPUTED",
	Finalized: "APPROVED",
	Paid: "PAID",
	Overdue: "OVERDUE",
};

/** All selectable invoice statuses in display order. */
export const INVOICE_STATUS_OPTIONS: InvoiceStatus[] = [
	"Draft",
	"Pending Approval",
	"Disputed",
	"Finalized",
	"Paid",
	"Overdue",
];

export interface BillingConfig {
	id: string;
	organizationId: string;
	clientBillingId: string;

	contactName: string | null;
	contactEmail: string | null;
	contactPhone: string | null;

	billingStreet: string | null;
	billingCity: string | null;
	billingState: string | null;
	billingZip: string | null;

	remittanceStreet: string | null;
	remittanceCity: string | null;
	remittanceState: string | null;
	remittanceZip: string | null;

	billingFrequency: string;
	paymentTerms: string;
	invoiceGrouping: string | null;
	currency: string;
	cycleStartDay: string | null;
	invoiceFormat: string | null;
	invoiceDeliveryEmail: boolean;
	invoiceDeliverySftp: boolean;
	invoiceDeliveryDownload: boolean;
	invoiceEmailRecipients: string[];

	otThreshold: number;
	timesheetApproval: boolean;
	mobileEntry: boolean;
	fileUpload: boolean;
	disputeTracking: boolean;

	mspPercent: number | null;
	saasPercent: number | null;
	markupType: string | null;
	markupValue: number | null;
}

export interface InvoiceListItem {
	id: string;
	invoiceNumber: string;
	invoiceDate: string;
	dueDate: string;
	periodStartDate: string | null;
	periodEndDate: string | null;
	totalAmount: number;
	status: DbInvoiceStatus;
	lineItemCount: number;
	workersCount?: number;
	totalHours?: number;
	disputedAmount?: number;
	disputedLineItemCount?: number;
	departmentCount?: number;
	projectCount?: number;
	projectName?: string | null;
	projectId?: string | null;
}

export interface InvoiceLineItem {
	id: string;
	description: string;
	quantity: number;
	unitPrice: number;
	amount: number;
	lineType: string | null;
	periodStart?: string | null;
	periodEnd?: string | null;

	candidateName?: string;
	locationName?: string;
	workDate?: string;
	timeEntryId?: string;
	payCode?: string;
	disputeReason?: string;
	disputedAmount?: number;
	isDisputed?: boolean;
	costCenter?: string;
	regularHrs?: number;
	regularRateMult?: string;
	otHrs?: number;
	otRateMult?: string;
	holidayHrs?: number;
	holidayRateMult?: string;
	billRate?: string;
	mspPercent?: string | number;
	saasPercent?: string | number;
	subtotal?: string | number;
}

export interface InvoiceDepartmentEntry {
	id: string;
	name: string;
	role: string;
	source: "mobile" | "upload";
	regularHrs: number;
	otHrs: number;
	holidayHrs: number;
	billRate: number;
	total: number;
	status: string;
}

export interface InvoiceDepartmentDetail {
	id: string;
	name: string;
	costCenter: string;
	candidatesCount: number;
	hours: number;
	amount: number;
	entries: InvoiceDepartmentEntry[];
}

export interface InvoiceDetail extends InvoiceListItem {
	subtotal: number;
	taxAmount: number;
	discountAmount: number;
	amountPaid: number;
	paymentTerms: string;
	notes: string | null;
	vendor?: { id: string; name: string } | null;
	draftSummary?: {
		totalAmountForPeriod: number;
		totalWorkers: number;
		totalHours: number;
		approvedAmount: number;
		disputedAmount: number;
		approvedItemCount: number;
		disputedItemCount: number;
		totalLineItemCount: number;
		status: "PARTIALLY_DISPUTED" | "READY_FOR_REVIEW";
	};
	departmentDetails?: InvoiceDepartmentDetail[];
	lineItems: InvoiceLineItem[];
}

export interface InvoiceHistoryItem {
	id: string;
	_id?: string;
	period: string;
	amount: string;
	dueDate: string;
	status: InvoiceStatus;
	lineItems: number;
	grouping?: string;
}

export interface PayCode {
	id?: string;
	code: string;
	description: string;
	multiplier: number | null;
}

export interface Holiday {
	id?: string;
	name: string;
	observedOn: string;
	holidayType: string | null;
}

export interface PayCodeFormItem {
	id?: string;
	code: string;
	description: string;
	category: string;
	multiplier: number | null;
}

export interface HolidayFormItem {
	id?: string;
	name: string;
	observedOn: string;
	holidayType: string;
}

export interface BillingFormState {
	clientBillingId: string;
	contactName: string;
	contactEmail: string;
	contactPhone: string;
	billingStreet: string;
	billingCity: string;
	billingState: string;
	billingZip: string;
	remittanceSameAsBilling: boolean;
	remittanceStreet: string;
	remittanceCity: string;
	remittanceState: string;
	remittanceZip: string;
	paymentTerms: string;
	deliveryEmail: boolean;
	deliverySftp: boolean;
	deliveryDownload: boolean;
	invoiceGrouping: string;
	currency: string;
	billingFrequency: string;
	cycleStartDay: string;
	otThreshold: number;
	timesheetApproval: boolean;
	mobileEntry: boolean;
	fileUpload: boolean;
	disputeTracking: boolean;
	mspPercent: number;
	saasPercent: number;
	costCenters: string[];
	payCodes: PayCodeFormItem[];
	holidays: HolidayFormItem[];
}
