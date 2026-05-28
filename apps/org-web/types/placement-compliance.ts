/** API: GET .../placements/:placementId/compliance */

import type {
	CandidateComplianceStatus,
	ComplianceListItemExpirationType,
	ComplianceListItemResponseStyle,
	ExpirationRuleUnit,
} from "@repo/shared";

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
	status: `${CandidateComplianceStatus}`;
	rejectionReason: string | null;
	responseStyle: `${ComplianceListItemResponseStyle}`;
	link: string | null;
	expirationType: `${ComplianceListItemExpirationType}`;
	expirationRuleValue: number | null;
	expirationRuleUnit: `${ExpirationRuleUnit}` | null;
	issueDate: string | null;
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
		rejected: number;
		total: number;
	};
	categories: PlacementComplianceCategory[];
};

export type AvailableComplianceListItem = {
	id: string;
	name: string;
	category: string;
};
