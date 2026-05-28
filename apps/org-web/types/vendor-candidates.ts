import type {
	CandidateSource,
	VendorCandidatePortalStatus,
} from "@repo/shared";

export interface VendorCandidateListRow {
	id: string;
	displayId: number;
	name: string;
	email: string;
	phone: string;
	specialty: string;
	occupationName: string;
	locationLine: string;
	experienceBandLabel: string;
	source: CandidateSource;
	documentsRequired: boolean;
	documentsComplete: boolean;
	status: VendorCandidatePortalStatus;
	tags: string[];
}

export interface VendorCandidateMetrics {
	totalCandidates: number;
	active: number;
	onboarding: number;
	inactive: number;
	docsCompleteLabel: string;
}
