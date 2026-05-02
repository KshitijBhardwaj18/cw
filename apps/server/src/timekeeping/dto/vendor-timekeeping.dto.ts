/** Vendor portal list row (mapped from TimesheetEntry). */
export type VendorTimekeepingListRow = {
	id: string;
	candidateId: string;
	candidateName: string;
	jobTitle: string;
	organization: string;
	date: string;
	startTime: string;
	endTime: string;
	totalHours: number;
	note: string | null;
	payCode: {
		id: string;
		code: string;
		description: string;
	} | null;
	/** Display status for vendor UI */
	vendorStatus: "draft" | "submitted" | "approved" | "rejected" | "disputed";
};

export type VendorTimekeepingMetrics = {
	totalShifts: number;
	pendingReview: number;
	errors: number;
	totalHours: number;
};
