import type { RequisitionStatus } from "@repo/shared";

export type OrgJobDisplayStatus = `${RequisitionStatus}`;

export interface OrgJobSubmissionPipeline {
	submitted: number;
	qualified: number;
	shortlisted: number;
	offers: number;
	rejected: number;
	placed: number;
}

export interface OrgJobCardItem {
	id: string;
	title: string;
	location: string;
	locationValue: string;
	occupation: string;
	occupationValue: string;
	department: string;
	departmentValue: string;
	specialty: string;
	specialtyValue: string;
	expectedStartDateIso: string;
	durationLabel: string;
	shiftLabel: string;
	hiringManager: string;
	expectedStartDate: string;
	status: OrgJobDisplayStatus;
	numberOfPositions: number;
	billRate: number | null;
	submissionPipeline: OrgJobSubmissionPipeline;
}
