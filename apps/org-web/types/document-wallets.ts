export type DocumentWalletStatus = "COMPLETE" | "IN_PROGRESS" | "CRITICAL";

/** Vendor document wallets list row (`GET /api/vendor/candidates/document-wallets`). */
export interface DocumentWalletListRow {
	id: string;
	name: string;
	email: string;
	phone?: string | null;
	specialty: string;
	completedDocs: number;
	totalDocs: number;
	docCounts: {
		ok: number;
		pending: number;
		missing: number;
		warning: number;
	};
	status: DocumentWalletStatus;
}

export interface DocumentWalletMetricStats {
	totalCandidates: number;
	complete: number;
	inProgress: number;
	critical: number;
}
