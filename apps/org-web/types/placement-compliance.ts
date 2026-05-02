/** API: GET .../placements/:placementId/compliance */

export type PlacementComplianceAuditEntry = {
	event: string;
	date: string;
	performedBy: string;
	description: string;
};

export type PlacementComplianceItemRow = {
	complianceListItemId: string;
	name: string;
	category: string;
	categoryKey: string;
	status: "missing" | "approved" | "expired" | "pending";
	completionDate: string | null;
	expirationDate: string | null;
	documentName: string | null;
	source: "requisition" | "placement";
	placementComplianceItemId: string | null;
	canRemove: boolean;
	auditLog: PlacementComplianceAuditEntry[];
};

export type PlacementComplianceCategory = {
	categoryKey: string;
	title: string;
	completed: number;
	total: number;
	items: PlacementComplianceItemRow[];
};

export type PlacementComplianceResponse = {
	summary: {
		complete: number;
		missing: number;
		expired: number;
		pending: number;
		total: number;
	};
	categories: PlacementComplianceCategory[];
};

export type AvailableComplianceListItem = {
	id: string;
	name: string;
	category: string;
};
