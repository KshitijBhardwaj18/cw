import type {
	CandidateComplianceStatus,
	ComplianceListItemExpirationType,
	ExpirationRuleUnit,
} from "@repo/shared";

export type CandidateDocumentWalletUiStatus = `${CandidateComplianceStatus}`;

export type CandidateDocumentWalletItem = {
	complianceListItemId: string;
	placementId: string | null;
	title: string;
	description: string;
	categoryKey: string;
	status: CandidateDocumentWalletUiStatus;
	rejectionReason: string | null;
	uploadedAt: string | null;
	issuedAt: string | null;
	expiresAt: string | null;
	documentFileName: string | null;
	expirationType: `${ComplianceListItemExpirationType}`;
	expirationRuleValue: number | null;
	expirationRuleUnit: `${ExpirationRuleUnit}` | null;
	responseStyle:
		| "PENDING_FILE_UPLOAD"
		| "INTERNAL_TASK"
		| "DOWNLOAD_AND_UPLOAD"
		| "LINK";
	link: string | null;
};

export type CandidateDocumentWalletCategory = {
	categoryKey: string;
	items: CandidateDocumentWalletItem[];
};

export type CandidateDocumentWalletSummary = {
	total: number;
	approved: number;
	approvedPercent: number;
	pendingVerification: number;
	pendingUpload: number;
	expired: number;
};

/** Upload-dialog option: requirement needs a new file (pending upload or expired). */
export type CandidateDocumentWalletPickerItem = {
	complianceListItemId: string;
	placementId: string | null;
	title: string;
	categoryKey: string;
	expirationType: `${ComplianceListItemExpirationType}`;
	expirationRuleValue: number | null;
	expirationRuleUnit: `${ExpirationRuleUnit}` | null;
};

export type CandidateDocumentWalletUploadVars = {
	complianceListItemId: string;
	file: File;
	expiryDate?: string;
	issueDate?: string;
};

export type CandidateDocumentWalletItemsResponse = {
	categories: CandidateDocumentWalletCategory[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};
