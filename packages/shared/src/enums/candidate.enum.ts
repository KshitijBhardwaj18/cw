export enum CandidateWorkforceType {
	SELF = "SELF",
	INTERNAL_FULL_TIME = "INTERNAL_FULL_TIME",
	INTERNAL_PART_TIME = "INTERNAL_PART_TIME",
	INTERNAL_PRN = "INTERNAL_PRN",
	INTERNAL_FLOAT_POOL = "INTERNAL_FLOAT_POOL",
	INTERNAL_VOLUNTEER = "INTERNAL_VOLUNTEER",
	EXTERNAL_1099 = "EXTERNAL_1099",
	EXTERNAL_EOR = "EXTERNAL_EOR",
	EXTERNAL_VENDOR_LTO = "EXTERNAL_VENDOR_LTO",
	EXTERNAL_VENDOR_PER_DIEM = "EXTERNAL_VENDOR_PER_DIEM",
}

export enum WorkforceBucket {
	SELF = "SELF",
	INTERNAL = "INTERNAL",
	EXTERNAL = "EXTERNAL",
}

export const SELF_WORKFORCE_TYPES = [
	CandidateWorkforceType.SELF,
] as const satisfies CandidateWorkforceType[];

export const INTERNAL_WORKFORCE_TYPES = [
	CandidateWorkforceType.INTERNAL_FULL_TIME,
	CandidateWorkforceType.INTERNAL_PART_TIME,
	CandidateWorkforceType.INTERNAL_PRN,
	CandidateWorkforceType.INTERNAL_FLOAT_POOL,
	CandidateWorkforceType.INTERNAL_VOLUNTEER,
] as const satisfies CandidateWorkforceType[];

export const EXTERNAL_WORKFORCE_TYPES = [
	CandidateWorkforceType.EXTERNAL_1099,
	CandidateWorkforceType.EXTERNAL_EOR,
	CandidateWorkforceType.EXTERNAL_VENDOR_LTO,
	CandidateWorkforceType.EXTERNAL_VENDOR_PER_DIEM,
] as const satisfies CandidateWorkforceType[];

export const ALL_WORKFORCE_TYPES = [
	...SELF_WORKFORCE_TYPES,
	...INTERNAL_WORKFORCE_TYPES,
	...EXTERNAL_WORKFORCE_TYPES,
] as const satisfies CandidateWorkforceType[];

export const CANDIDATE_WORKFORCE_TYPE_OPTIONS = [
	{
		value: CandidateWorkforceType.INTERNAL_FULL_TIME,
		label: "Internal-Full Time",
	},
	{
		value: CandidateWorkforceType.INTERNAL_PART_TIME,
		label: "Internal- Part-Time",
	},
	{
		value: CandidateWorkforceType.INTERNAL_PRN,
		label: "Internal- PRN",
	},
	{
		value: CandidateWorkforceType.INTERNAL_FLOAT_POOL,
		label: "Internal- Float Pool",
	},
	{
		value: CandidateWorkforceType.INTERNAL_VOLUNTEER,
		label: "Internal- Volunteer",
	},
	{
		value: CandidateWorkforceType.EXTERNAL_1099,
		label: "External- 1099",
	},
	{
		value: CandidateWorkforceType.EXTERNAL_EOR,
		label: "External- EOR",
	},
	{
		value: CandidateWorkforceType.EXTERNAL_VENDOR_PER_DIEM,
		label: "External- Vendor Per Diem",
	},
	{
		value: CandidateWorkforceType.EXTERNAL_VENDOR_LTO,
		label: "External- Vendor LTO",
	},
] as const satisfies readonly {
	value: CandidateWorkforceType;
	label: string;
}[];

export function getWorkforceBucket(
	workforceType: string | null | undefined,
): WorkforceBucket | null {
	if (!workforceType) return null;
	if ((SELF_WORKFORCE_TYPES as readonly string[]).includes(workforceType))
		return WorkforceBucket.SELF;
	if ((INTERNAL_WORKFORCE_TYPES as readonly string[]).includes(workforceType))
		return WorkforceBucket.INTERNAL;
	if ((EXTERNAL_WORKFORCE_TYPES as readonly string[]).includes(workforceType))
		return WorkforceBucket.EXTERNAL;
	return null;
}
