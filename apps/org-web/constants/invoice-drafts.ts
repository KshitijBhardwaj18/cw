export type InvoiceDraftStatus =
	| "PARTIALLY_DISPUTED"
	| "READY_FOR_REVIEW"
	| "DRAFT";

export const INVOICE_DRAFT_STATUS_LABEL: Record<InvoiceDraftStatus, string> = {
	PARTIALLY_DISPUTED: "Partially Disputed",
	READY_FOR_REVIEW: "Ready for Review",
	DRAFT: "Draft",
};

export type InvoiceDraftProjectOption = {
	value: string;
	label: string;
};
