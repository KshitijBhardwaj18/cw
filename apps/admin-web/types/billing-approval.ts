export type InvoiceApprovalStatus = "pending" | "disputed";

export interface CandidateEntry {
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

export interface DepartmentDetail {
	id: string;
	name: string;
	costCenter: string;
	candidatesCount: number;
	hours: number;
	amount: number;
	entries: CandidateEntry[];
}

export interface InvoiceApproval {
	id: string;
	invoiceNumber: string;
	status: InvoiceApprovalStatus;
	cycleType: string;
	startDate: string;
	endDate: string;
	submittedDate: string;
	totalAmount: number;
	totalHours: number;
	departments: number;
	disputeWindowDays: number;
	departmentDetails: DepartmentDetail[];
}
