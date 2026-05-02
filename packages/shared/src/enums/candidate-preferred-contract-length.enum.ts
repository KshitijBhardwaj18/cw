/** Mirrors `CandidatePreferredContractLength` in Prisma — keep values in sync. */
export enum CandidatePreferredContractLength {
	PER_DIEM = "PER_DIEM",
	BLOCKED_BOOKING = "BLOCKED_BOOKING",
	WEEKS_4_12 = "WEEKS_4_12",
	MONTHS_3 = "MONTHS_3",
	MONTHS_3_6 = "MONTHS_3_6",
	MONTHS_6_9 = "MONTHS_6_9",
	MONTHS_9_12 = "MONTHS_9_12",
	PERMANENT_ROLES = "PERMANENT_ROLES",
	OPEN_TO_ANYTHING = "OPEN_TO_ANYTHING",
}

export const CANDIDATE_PREFERRED_CONTRACT_LENGTH_OPTIONS = [
	{
		value: CandidatePreferredContractLength.PER_DIEM,
		label: "Per Diem",
	},
	{
		value: CandidatePreferredContractLength.BLOCKED_BOOKING,
		label: "Blocked booking",
	},
	{
		value: CandidatePreferredContractLength.WEEKS_4_12,
		label: "4–12 weeks",
	},
	{
		value: CandidatePreferredContractLength.MONTHS_3,
		label: "3 months",
	},
	{
		value: CandidatePreferredContractLength.MONTHS_3_6,
		label: "3–6 months",
	},
	{
		value: CandidatePreferredContractLength.MONTHS_6_9,
		label: "6–9 months",
	},
	{
		value: CandidatePreferredContractLength.MONTHS_9_12,
		label: "9–12 months",
	},
	{
		value: CandidatePreferredContractLength.PERMANENT_ROLES,
		label: "Permanent roles",
	},
	{
		value: CandidatePreferredContractLength.OPEN_TO_ANYTHING,
		label: "Open to anything",
	},
] as const satisfies readonly {
	value: CandidatePreferredContractLength;
	label: string;
}[];
