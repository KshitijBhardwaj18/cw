import type { CandidateComplianceStatus } from "@repo/shared";

export interface MatchBreakdownItem {
	criterionName: string;
	matched: boolean;
	weight: number;
}

export interface CandidateMatchListItem {
	id: string;
	jobTitle: string;
	occupation: string | null;
	specialties: Array<{ id: string; name: string }>;
	facilityName: string | null;
	locationCity: string | null;
	locationState: string | null;
	locationId: string | null;
	department: string | null;
	unitName: string | null;
	shiftType: string | null;
	shiftHours: string | null;
	contractType: string;
	lengthWeeks: number | null;
	startDate: string | null;
	endDate: string | null;
	billRate: number | null;
	incentiveType: string | null;
	incentiveAmount: number | null;
	benefitsPerks: string[];
	numberOfPositions: number;
	positionsFilled: number;
	jobSummary: string | null;
	publishedAt: string | null;
	isSaved: boolean;
	isApplied: boolean;
	matchPercentage: number;
	matchBreakdown: MatchBreakdownItem[];
}

export type CandidateJobAcceptanceCriterionStatus =
	`${CandidateComplianceStatus}`;

export interface CandidateJobAcceptanceCriterion {
	id: string;
	name: string;
	satisfied: boolean;
	responseStyle:
		| "PENDING_FILE_UPLOAD"
		| "INTERNAL_TASK"
		| "DOWNLOAD_AND_UPLOAD"
		| "LINK";
	status: CandidateJobAcceptanceCriterionStatus;
	rejectionReason: string | null;
	documentName: string | null;
	expirationDate: string | null;
	link: string | null;
	instructionalNotes: string | null;
	expirationType: "EXPIRATION_DATE" | "EXPIRATION_RULE" | "NON_EXPIRABLE";
	expirationRuleValue: number | null;
	expirationRuleUnit: "DAYS" | "MONTHS" | "YEARS" | null;
}

export interface CandidateMatchDetail extends CandidateMatchListItem {
	hoursPerWeek: number | null;
	shiftsPerWeek: number | null;
	interviewRequired: string | null;
	whoCanSubmit: string;
	vendorNotes: string | null;
	isSubmittedForVendorReview: boolean;
	acceptanceCriteria: CandidateJobAcceptanceCriterion[];
}

export interface CandidateMatchesListResponse {
	items: CandidateMatchListItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface CandidateMatchesQueryParams {
	page?: number;
	limit?: number;
	search?: string;
	specialtyId?: string;
	locationId?: string;
	shiftType?: string;
	contractType?: string;
	savedOnly?: boolean;
}
