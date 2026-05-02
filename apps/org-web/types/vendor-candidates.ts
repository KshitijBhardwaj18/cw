export type VendorCandidateStatus = "ACTIVE" | "ONBOARDING" | "INACTIVE";

export type VendorCandidateSource = "VENDOR" | "DIRECT" | "PREVIOUS_WORKER";

export interface VendorCandidateListRow {
	id: string;
	displayId: number;
	name: string;
	email: string;
	phone: string;
	specialty: string;
	occupationName: string;
	locationLine: string;
	yearsExperienceLabel: string;
	source: VendorCandidateSource;
	documentsComplete: boolean;
	status: VendorCandidateStatus;
}

export interface VendorCandidateMetrics {
	totalCandidates: number;
	active: number;
	onboarding: number;
	inactive: number;
	docsCompleteLabel: string;
}
