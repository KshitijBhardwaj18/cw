export type SubmissionStatus =
	| "Submitted"
	| "In Review"
	| "Interview"
	| "Offer"
	| "Accepted"
	| "Rejected"
	| "Withdrawn";

export type CandidateSubmissionTabStats = {
	"all-applications": number;
	submitted: number;
	"in-review": number;
	interview: number;
	offer: number;
	accepted: number;
	rejected: number;
};

export interface CandidateSubmission {
	id: string;
	jobTitle: string;
	status: SubmissionStatus;
	location: string;
	appliedDate: string;
	updatedDate: string;
}

import type { CandidateComplianceStatus } from "@repo/shared";

export type CandidateComplianceItemStatus = `${CandidateComplianceStatus}`;

export interface CandidateSubmissionDetail extends CandidateSubmission {
	summary: {
		submitted: string;
		lastUpdate: string;
		payRate: string;
	};
	candidateInfo: {
		name: string;
		occupation: string;
		specialty: string;
	};
	questionnaire: {
		label: string;
		value: string;
	}[];
	summaryNote: string;
	complianceStatus: {
		approved: number;
		pending: number;
		missing: number;
		items: {
			label: string;
			status: CandidateComplianceItemStatus;
		}[];
	};
	requestedTimeOff: string[];
}
