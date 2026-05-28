export type CredentialEntryDetailType = "credential" | "upcoming-placement";

import type {
	CandidateComplianceStatus,
	ComplianceListItemExpirationType,
	ExpirationRuleUnit,
} from "@repo/shared";

export type CredentialComplianceItemStatus = `${CandidateComplianceStatus}`;

export interface CredentialComplianceItem {
	id: string;
	name: string;
	category: string;
	sourceLabel?: string;
	requiredBy: string;
	status: CredentialComplianceItemStatus;
	documentName?: string;
	completionDate?: string;
	issueDate?: string;
	expirationDate?: string;
	expirationType: `${ComplianceListItemExpirationType}`;
	expirationRuleValue: number | null;
	expirationRuleUnit: `${ExpirationRuleUnit}` | null;
}

export interface CredentialComplianceCategory {
	name: string;
	items: CredentialComplianceItem[];
}

export interface CredentialEntrySummary {
	totalItems: number;
	completedItems: number;
	missingItemsCount: number;
	expiredItemsCount: number;
	pendingReviewCount: number;
	percentComplete: number;
}

export interface CredentialPlacementContext {
	jobOrRequisition: string;
	location: string;
	dateLabel: string;
	dateValue: string;
	statusLabel: string;
	department?: string;
	vendor?: string;
	hiringManager?: string;
}

export interface CredentialEntryDetailRecord {
	id: string;
	entryType: CredentialEntryDetailType;
	name: string;
	role: string;
	backHref: string;
	backLabel: string;
	title: string;
	subtitle: string;
	placementContext: CredentialPlacementContext;
	complianceCategories: CredentialComplianceCategory[];
	summary: CredentialEntrySummary;
}

export interface CredentialEntryStatusUpdatePayload {
	itemId: string;
	status: CredentialComplianceItemStatus;
	completionDate?: string;
	expirationDate?: string;
	notes?: string;
}

export interface CredentialEntryUploadDocumentPayload {
	itemId: string;
	file: File;
	expirationDate?: string;
	issueDate?: string;
}
