export type CandidateDocumentWalletUiStatus =
	| "pending_upload"
	| "pending_verification"
	| "approved"
	| "expired";

export type CandidateDocumentWalletItem = {
	complianceListItemId: string;
	placementId: string | null;
	title: string;
	description: string;
	categoryKey: string;
	status: CandidateDocumentWalletUiStatus;
	uploadedAt: string | null;
	expiresAt: string | null;
	documentFileName: string | null;
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
};

export type CandidateDocumentWalletUploadVars = {
	complianceListItemId: string;
	file: File;
	expiryDate?: string;
};

export type CandidateDocumentWalletItemsResponse = {
	categories: CandidateDocumentWalletCategory[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};
