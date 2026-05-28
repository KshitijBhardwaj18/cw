/** Placement card row from `GET /api/org/placements` (session active org). */
export type PlacementStatus =
	| "UPCOMING"
	| "ACTIVE"
	| "ON_HOLD"
	| "COMPLETED"
	| "TERMINATED";

export type PlacementTab = "upcoming" | "active" | "completed";

export interface PlacementCardItem {
	id: string;
	placementNumber: string;
	status: PlacementStatus;
	jobTitle: string | null;
	startDate: Date | string | null;
	endDate: Date | string | null;
	compliancePercent: number;
	candidateName: string;
	sourceType: string;
	locationName: string | null;
	departmentName: string | null;
	hiringManagerName: string | null;
	workforceListLabel: string | null;
	vendorName: string | null;
	/** Bill rate (USD/hr) when present — list API includes for vendor dashboard. */
	billRate: number | null;
}

/** Placement detail from `GET .../placements/:placementId`. */
export interface PlacementDetailItem {
	id: string;
	placementNumber: string;
	status: PlacementStatus;
	statusSubtext: string;
	// Candidate
	candidateName: string;
	candidateEmail: string;
	candidatePhone: string;
	occupation: string;
	specialty: string;
	licenseNumber: string | null;
	// Job / Requisition
	jobTitle: string;
	requisition: string;
	location: string;
	department: string;
	hiringManager: string;
	vendor: string | null;
	// Assignment Period
	startDate: string;
	endDate: string;
	currentStatus: string;
	// Location & Role
	departmentUnit: string;
	workforceListLabel: string;
	// Schedule & Shift
	shiftType: string;
	shiftSchedule: string;
	hoursPerWeek: string;
	// Rates & Compensation
	billRate: string | null;
	payRate: string | null;
	overtimeEligible: boolean;
	// Vendor & Contacts
	vendorContact: string | null;
	vendorContactInfo: string | null;
}

/** Placement notes row (GET .../placements/:id/notes). */
export interface PlacementNote {
	id: string;
	text: string;
	addedBy: string;
	addedByRole: string;
	createdAt: string;
}

/** Placement tasks row (GET .../placements/:id/tasks). */
export interface PlacementTask {
	id: string;
	title: string;
	description?: string;
	dueDate: string;
	status: "pending" | "completed";
	assignedTo: string;
	createdBy: string;
	createdAt: string;
}

/** Input to end/terminate a placement. */
export interface EndPlacementInput {
	terminationReason?: string;
}
