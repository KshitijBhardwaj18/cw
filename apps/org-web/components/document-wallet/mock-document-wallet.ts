/** Per-document status inside a wallet (distinct from list-row status in `types/document-wallets`). */
export type DocumentRequirementStatus =
	| "approved"
	| "pending_verification"
	| "pending_upload"
	| "expired"
	| "rejected";

export type DocumentCategoryId =
	| "background-identity"
	| "employee-health"
	| "professional-credentials"
	| "compliance-training";

export interface DocumentWalletRequirement {
	id: string;
	title: string;
	description: string;
	status: DocumentRequirementStatus;
	uploadedAt?: string;
	expiresAt?: string;
	/** Shown in the file details box */
	fileName?: string;
	fileSizeLabel?: string;
	rejectionReason?: string;
}

export interface DocumentWalletCategory {
	id: DocumentCategoryId;
	label: string;
	items: DocumentWalletRequirement[];
}

export const DOCUMENT_WALLET_CATEGORIES_CANDIDATE: DocumentWalletCategory[] = [
	{
		id: "background-identity",
		label: "Background & Identity",
		items: [
			{
				id: "drivers-license",
				title: "Driver's License",
				description: "Valid government-issued ID",
				status: "pending_upload",
			},
			{
				id: "passport",
				title: "Passport",
				description: "For work authorization verification",
				status: "approved",
				uploadedAt: "2024-01-20",
				expiresAt: "2030-05-20",
				fileName: "passport.pdf",
				fileSizeLabel: "380 KB",
			},
		],
	},
	{
		id: "employee-health",
		label: "Employee Health",
		items: [
			{
				id: "physical-exam",
				title: "Physical Exam",
				description: "Annual health assessment",
				status: "pending_verification",
				uploadedAt: "2024-01-18",
				expiresAt: "2025-01-18",
				fileName: "physical-exam-2024.pdf",
				fileSizeLabel: "512 KB",
			},
			{
				id: "tb-test",
				title: "TB Test",
				description: "Tuberculosis screening",
				status: "expired",
				uploadedAt: "2023-08-10",
				expiresAt: "2024-08-10",
				fileName: "tb-test-2023.pdf",
				fileSizeLabel: "245 KB",
			},
			{
				id: "immunization",
				title: "Immunization Records",
				description: "Vaccination history (MMR, Hepatitis B, etc.)",
				status: "approved",
				uploadedAt: "2024-01-12",
				expiresAt: "2026-01-12",
				fileName: "immunization-records.pdf",
				fileSizeLabel: "420 KB",
			},
			{
				id: "flu-shot",
				title: "Flu Shot",
				description: "Annual influenza vaccination",
				status: "pending_upload",
			},
			{
				id: "covid-vax",
				title: "COVID-19 Vaccination",
				description: "Proof of vaccination",
				status: "approved",
				uploadedAt: "2024-02-01",
				expiresAt: "2025-02-01",
				fileName: "covid-vax-card.pdf",
				fileSizeLabel: "198 KB",
			},
		],
	},
	{
		id: "professional-credentials",
		label: "Professional Credentials",
		items: [
			{
				id: "rn-license",
				title: "RN License",
				description: "Active state nursing license",
				status: "approved",
				uploadedAt: "2024-01-10",
				expiresAt: "2026-12-31",
				fileName: "rn-license-ma.pdf",
				fileSizeLabel: "320 KB",
			},
			{
				id: "bls",
				title: "BLS Certification",
				description: "Basic Life Support",
				status: "pending_verification",
				uploadedAt: "2024-02-15",
				expiresAt: "2026-02-15",
				fileName: "bls-cert.pdf",
				fileSizeLabel: "210 KB",
			},
			{
				id: "acls",
				title: "ACLS Certification",
				description: "Advanced Cardiovascular Life Support",
				status: "pending_upload",
			},
			{
				id: "specialty-cert",
				title: "Specialty Certification",
				description: "CCRN or equivalent",
				status: "pending_upload",
			},
		],
	},
	{
		id: "compliance-training",
		label: "Compliance & Training",
		items: [
			{
				id: "background-check",
				title: "Background Check",
				description: "Criminal background screening",
				status: "pending_verification",
				uploadedAt: "2024-01-14",
				fileName: "background-check.pdf",
				fileSizeLabel: "156 KB",
			},
			{
				id: "drug-screen",
				title: "Drug Screen",
				description: "Pre-employment drug test",
				status: "pending_upload",
			},
			{
				id: "hipaa",
				title: "HIPAA Training",
				description: "Privacy and security training",
				status: "pending_upload",
			},
			{
				id: "osha",
				title: "OSHA Training",
				description: "Occupational safety training",
				status: "pending_upload",
			},
		],
	},
];

/** Vendor wallet: includes `rejected` for review workflow. */
export const DOCUMENT_WALLET_CATEGORIES_VENDOR: DocumentWalletCategory[] = [
	{
		id: "background-identity",
		label: "Background & Identity",
		items: [
			{
				id: "drivers-license",
				title: "Driver's License",
				description: "Valid government-issued ID",
				status: "pending_upload",
			},
			{
				id: "passport",
				title: "Passport",
				description: "For work authorization verification",
				status: "approved",
				uploadedAt: "2024-01-20",
				expiresAt: "2030-05-20",
				fileName: "passport.pdf",
				fileSizeLabel: "380 KB",
			},
		],
	},
	{
		id: "employee-health",
		label: "Employee Health",
		items: [
			{
				id: "physical-exam",
				title: "Physical Exam",
				description: "Annual health assessment",
				status: "pending_verification",
				uploadedAt: "2024-01-18",
				expiresAt: "2025-01-18",
				fileName: "physical-exam-2024.pdf",
				fileSizeLabel: "512 KB",
			},
			{
				id: "tb-test",
				title: "TB Test",
				description: "Tuberculosis screening",
				status: "rejected",
				uploadedAt: "2023-08-10",
				expiresAt: "2024-08-10",
				fileName: "tb-test-2023.pdf",
				fileSizeLabel: "245 KB",
				rejectionReason:
					"Document is not legible. Please upload a clearer version.",
			},
			{
				id: "immunization",
				title: "Immunization Records",
				description: "Vaccination history (MMR, Hepatitis B, etc.)",
				status: "approved",
				uploadedAt: "2024-01-12",
				expiresAt: "2026-01-12",
				fileName: "immunization-records.pdf",
				fileSizeLabel: "420 KB",
			},
			{
				id: "flu-shot",
				title: "Flu Shot",
				description: "Annual influenza vaccination",
				status: "pending_upload",
			},
			{
				id: "covid-vax",
				title: "COVID-19 Vaccination",
				description: "Proof of vaccination",
				status: "approved",
				uploadedAt: "2024-02-01",
				expiresAt: "2025-02-01",
				fileName: "covid-vax-card.pdf",
				fileSizeLabel: "198 KB",
			},
		],
	},
	{
		id: "professional-credentials",
		label: "Professional Credentials",
		items: [
			{
				id: "rn-license",
				title: "RN License",
				description: "Active state nursing license",
				status: "approved",
				uploadedAt: "2024-01-10",
				expiresAt: "2026-12-31",
				fileName: "rn-license-ma.pdf",
				fileSizeLabel: "320 KB",
			},
			{
				id: "bls",
				title: "BLS Certification",
				description: "Basic Life Support",
				status: "pending_verification",
				uploadedAt: "2024-02-15",
				expiresAt: "2026-02-15",
				fileName: "bls-cert.pdf",
				fileSizeLabel: "210 KB",
			},
			{
				id: "acls",
				title: "ACLS Certification",
				description: "Advanced Cardiovascular Life Support",
				status: "pending_upload",
			},
			{
				id: "specialty-cert",
				title: "Specialty Certification",
				description: "CCRN or equivalent",
				status: "pending_upload",
			},
		],
	},
	{
		id: "compliance-training",
		label: "Compliance & Training",
		items: [
			{
				id: "background-check",
				title: "Background Check",
				description: "Criminal background screening",
				status: "pending_verification",
				uploadedAt: "2024-01-14",
				fileName: "background-check.pdf",
				fileSizeLabel: "156 KB",
			},
			{
				id: "drug-screen",
				title: "Drug Screen",
				description: "Pre-employment drug test",
				status: "pending_upload",
			},
			{
				id: "hipaa",
				title: "HIPAA Training",
				description: "Privacy and security training",
				status: "pending_upload",
			},
			{
				id: "osha",
				title: "OSHA Training",
				description: "Occupational safety training",
				status: "pending_upload",
			},
		],
	},
];

/** @deprecated Prefer `DOCUMENT_WALLET_CATEGORIES_VENDOR` or `DOCUMENT_WALLET_CATEGORIES_CANDIDATE`. */
export const DOCUMENT_WALLET_CATEGORIES = DOCUMENT_WALLET_CATEGORIES_VENDOR;

export interface DocumentWalletSummary {
	total: number;
	completed: number;
	percent: number;
	approved: number;
	pendingVerification: number;
	rejected: number;
	missing: number;
	expired: number;
}

export function getCategoryApprovedCount(
	category: DocumentWalletCategory,
): number {
	return category.items.filter((item) => item.status === "approved").length;
}

export function getDocumentWalletSummary(
	categories: DocumentWalletCategory[],
): DocumentWalletSummary {
	let total = 0;
	let approved = 0;
	let pendingVerification = 0;
	let rejected = 0;
	let missing = 0;
	let expired = 0;

	for (const cat of categories) {
		for (const item of cat.items) {
			total += 1;
			switch (item.status) {
				case "approved":
					approved += 1;
					break;
				case "pending_verification":
					pendingVerification += 1;
					break;
				case "rejected":
					rejected += 1;
					break;
				case "pending_upload":
					missing += 1;
					break;
				case "expired":
					expired += 1;
					break;
				default:
					break;
			}
		}
	}

	const completed = approved;
	const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

	return {
		total,
		completed,
		percent,
		approved,
		pendingVerification,
		rejected,
		missing,
		expired,
	};
}
