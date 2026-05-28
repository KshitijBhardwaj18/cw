import type {
	CandidateComplianceStatus,
	VendorCandidateJobBoardMatchTier,
	VendorCandidatePortalStatus,
} from "@repo/shared";
import type { SubmissionStageKey } from "@/constants/submissions";

/** Status shown on job-board candidate cards (portal lifecycle, submission stage, or match tier). */
export type VendorJobBoardCandidateStatus =
	| VendorCandidatePortalStatus
	| VendorCandidateJobBoardMatchTier
	| SubmissionStageKey;

export interface Requisition {
	id: string;
	title: string;
	hospital: string;
	location: string;
	shift: string;
	department: string;
	vendorRate: string;
	duration: string;
	startDate: string;
	openings: string;
	occupation: string;
	occupationId: string | null;
	specialty: string;
	specialtyIds: string[];
	requirements?: string[];
	jobSummary?: string;
	benefits?: string[];
	contractType: string;
	expectedWeeklyHours: string;
	shiftPattern: string;
	startDateFlexibility: string;
	savedByVendorUser?: boolean;
}

export interface Candidate {
	id: string;
	name: string;
	status: VendorJobBoardCandidateStatus;
	role: string;
	location: string;
	experience: string;
	availability: string;
	matchScore: number;
	statusUpdatedDate?: string;
	email?: string;
	phone?: string;
	specialty: string;
	address: string;
	occupation: string;
	preferredShifts: string;
	ageRange: string;
	availableStartDate: string;
	travelScope: string;
	yearsOfBirth: string;
	rnCertFirst: string;
	occupationalQuestionnaire: string;
	yearsOfExperienceUnitCare: string;
	experienceChemicalWound: string;
	experienceNeonatalICU: string;
	certificationPALS: string;
	summaryNote: string;
	skills: string[];
	tags: string[];
	compliance: {
		name: string;
		status: `${CandidateComplianceStatus}`;
	}[];
}
