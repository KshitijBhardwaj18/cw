export interface MatchBreakdownItem {
	criterionName: string;
	matched: boolean;
	weight: number;
}

export interface CandidateMatchListItem {
	id: string;
	jobTitle: string;
	occupation: string | null;
	specialty: string | null;
	specialtyId: string | null;
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

export interface CandidateMatchDetail extends CandidateMatchListItem {
	hoursPerWeek: number | null;
	shiftsPerWeek: number | null;
	interviewRequired: string | null;
	whoCanSubmit: string;
	vendorNotes: string | null;
	acceptanceCriteria: { id: string; name: string }[];
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
