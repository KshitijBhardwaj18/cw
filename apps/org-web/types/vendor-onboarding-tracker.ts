export type OnboardingStatus = "Cleared" | "In-Progress" | "Behind Schedule";

export type OnboardingDocStatus =
	| "complete"
	| "pending"
	| "missing"
	| "in-progress";

export interface OnboardingDocument {
	name: string;
	uploadedDate?: string;
	dueDate?: string;
	status: OnboardingDocStatus;
}

export interface OnboardingCandidate {
	id: string;
	name: string;
	initials: string;
	role: string;
	startDate: string;
	daysRemaining: number;
	location: string;
	status: OnboardingStatus;
	progress: number;
	documentsCompleted: number;
	totalDocuments: number;
	dueDate: string;
	detailedDocuments: OnboardingDocument[];
}

export interface OnboardingWeekGroup {
	week: number;
	label: string;
	description: string;
	candidates: OnboardingCandidate[];
}
