import { CandidateWorkforceType } from "@repo/shared";
import type {
	AddExistingTalentCandidateRow,
	AddExistingTalentStatusValue,
	CandidateSourceValue,
} from "@/types/talent-community-add-existing";

export const CANDIDATE_SOURCE_LABELS: Record<CandidateSourceValue, string> = {
	DIRECT: "Direct",
	VENDOR: "Vendor",
	PREVIOUS_WORKER: "Previous Worker",
};

export const SUBMISSION_STAGE_LABELS: Record<
	Exclude<AddExistingTalentStatusValue, "INACTIVE">,
	string
> = {
	SUBMITTED: "Submitted",
	QUALIFIED: "Qualified",
	SHORTLISTED: "Shortlisted",
	INTERVIEW_SCHEDULED: "Interview Scheduled",
	INTERVIEW_COMPLETED: "Interview Completed",
	OFFERED: "Offered",
	ACCEPTED: "Accepted",
	WITHDRAWN: "Withdrawn",
	REJECTED: "Rejected",
};

export function getAddExistingTalentStatusLabel(
	status: AddExistingTalentStatusValue,
): string {
	if (status === "INACTIVE") return "Inactive";
	return SUBMISSION_STAGE_LABELS[status];
}

export const ADD_EXISTING_STATUS_FILTER_OPTIONS: {
	value: string;
	label: string;
}[] = [
	{ value: "all", label: "All Statuses" },
	{ value: "INACTIVE", label: "Inactive" },
	...(
		Object.keys(SUBMISSION_STAGE_LABELS) as Exclude<
			AddExistingTalentStatusValue,
			"INACTIVE"
		>[]
	).map((k) => ({
		value: k,
		label: SUBMISSION_STAGE_LABELS[k],
	})),
];

export const ADD_EXISTING_SOURCE_FILTER_OPTIONS: {
	value: string;
	label: string;
}[] = [
	{ value: "all", label: "All Sources" },
	...(Object.keys(CANDIDATE_SOURCE_LABELS) as CandidateSourceValue[]).map(
		(k) => ({ value: k, label: CANDIDATE_SOURCE_LABELS[k] }),
	),
];

export const ADD_EXISTING_TALENT_MOCK_DATA: AddExistingTalentCandidateRow[] = [
	{
		id: "a1",
		name: "Sarah Mitchell",
		email: "sarah.mitchell@email.com",
		workforceGroup: "Nursing Staff",
		workforceType: CandidateWorkforceType.INTERNAL_FULL_TIME,
		occupation: "Registered Nurse (RN)",
		specialty: "Cardiac Care",
		source: "DIRECT",
		status: "QUALIFIED",
	},
	{
		id: "a2",
		name: "James Park",
		email: "james.park@agency.com",
		workforceGroup: "Rehabilitation Team",
		workforceType: CandidateWorkforceType.EXTERNAL_VENDOR_PER_DIEM,
		occupation: "Physical Therapist",
		specialty: "Orthopedic",
		source: "VENDOR",
		status: "SUBMITTED",
	},
	{
		id: "a3",
		name: "Maria Santos",
		email: "maria.santos@hospital.com",
		workforceGroup: "Medical Support",
		workforceType: CandidateWorkforceType.INTERNAL_PART_TIME,
		occupation: "Medical Assistant",
		specialty: "Wound Care",
		source: "PREVIOUS_WORKER",
		status: "SHORTLISTED",
	},
	{
		id: "a4",
		name: "David Chen",
		email: "david.chen@email.com",
		workforceGroup: "Nursing Staff",
		workforceType: CandidateWorkforceType.INTERNAL_PRN,
		occupation: "Registered Nurse (RN)",
		specialty: "Med-Surg",
		source: "DIRECT",
		status: "INACTIVE",
	},
	{
		id: "a5",
		name: "Emily Watson",
		email: "emily.w@vendor.com",
		workforceGroup: "Rehabilitation Team",
		workforceType: CandidateWorkforceType.EXTERNAL_VENDOR_LTO,
		occupation: "Occupational Therapist",
		specialty: "Neurologic",
		source: "VENDOR",
		status: "INTERVIEW_SCHEDULED",
	},
	{
		id: "a6",
		name: "Robert Kim",
		email: "robert.kim@email.com",
		workforceGroup: "Medical Support",
		workforceType: CandidateWorkforceType.INTERNAL_FULL_TIME,
		occupation: "Clinical Technician",
		specialty: "Laboratory",
		source: "DIRECT",
		status: "REJECTED",
	},
];

export const ADD_EXISTING_WORKFORCE_GROUP_OPTIONS: {
	value: string;
	label: string;
}[] = [
	{ value: "all", label: "All Groups" },
	...Array.from(
		new Set(ADD_EXISTING_TALENT_MOCK_DATA.map((r) => r.workforceGroup)),
	).map((g) => ({ value: g, label: g })),
];
