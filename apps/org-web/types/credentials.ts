import type { LucideIcon } from "lucide-react";

export type CredentialStatus = "EXPIRING_SOON" | "EXPIRED" | "CRITICAL";

export type UpcomingPlacementComplianceStatus =
	| "MISSING"
	| "IN_PROGRESS"
	| "COMPLETE";

export type UpcomingPlacementStatKey =
	| "TOTAL_UPCOMING"
	| "READY_TO_START"
	| "IN_PROGRESS"
	| "MISSING_ITEMS";

export interface CredentialTableItem {
	id: string;
	placementId: string;
	complianceListItemId: string;
	candidateId: string;
	workerName: string;
	credentialName: string;
	credentialType: string;
	jobTitle: string;
	location: string | null;
	expiryDate: string;
	expiryMeta: string;
	status: CredentialStatus;
	department: string | null;
	vendor: string | null;
	hiringManager: string | null;
}

export interface StatusStatCardItem<T extends string = string> {
	key: T;
	label: string;
	subLabel: string;
	countClassName: string;
	activeClassName: string;
	iconClassName: string;
	icon: LucideIcon;
}

export type CredentialStatCardItem = StatusStatCardItem<CredentialStatus>;

export type UpcomingPlacementStatCardItem =
	StatusStatCardItem<UpcomingPlacementStatKey>;

export interface UpcomingPlacementTableItem {
	id: string;
	candidateName: string;
	candidateInitials: string;
	jobTitle: string;
	location: string | null;
	department: string | null;
	vendor: string | null;
	hiringManager: string | null;
	startDate: string;
	startMeta: string;
	complianceStatus: UpcomingPlacementComplianceStatus;
	progressCompleted: number;
	progressTotal: number;
	missingItems: string;
}
