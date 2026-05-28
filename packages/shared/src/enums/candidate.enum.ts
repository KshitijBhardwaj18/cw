export enum CandidateWorkforceType {
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
export enum VendorCandidateWorkforceType {
	EXTERNAL_1099 = "EXTERNAL_1099",
	EXTERNAL_EOR = "EXTERNAL_EOR",
	EXTERNAL_VENDOR_LTO = "EXTERNAL_VENDOR_LTO",
	EXTERNAL_VENDOR_PER_DIEM = "EXTERNAL_VENDOR_PER_DIEM",
}

/** Mirrors Prisma `CandidateExperienceBand`. */
export enum CandidateExperienceBand {
	LT_1 = "LT_1",
	Y1_2 = "Y1_2",
	Y3_5 = "Y3_5",
	Y6_9 = "Y6_9",
	Y10_PLUS = "Y10_PLUS",
}

export const CANDIDATE_EXPERIENCE_BAND_OPTIONS = [
	{ value: CandidateExperienceBand.LT_1, label: "Less than 1 year" },
	{ value: CandidateExperienceBand.Y1_2, label: "1–2 years" },
	{ value: CandidateExperienceBand.Y3_5, label: "3–5 years" },
	{ value: CandidateExperienceBand.Y6_9, label: "6–9 years" },
	{ value: CandidateExperienceBand.Y10_PLUS, label: "10+ years" },
] as const satisfies readonly {
	value: CandidateExperienceBand;
	label: string;
}[];

/** Mirrors Prisma `CandidateSource`. */
export enum CandidateSource {
	DIRECT = "DIRECT",
	VENDOR = "VENDOR",
	PREVIOUS_WORKER = "PREVIOUS_WORKER",
}

export const CANDIDATE_SOURCE_OPTIONS = [
	{ value: CandidateSource.DIRECT, label: "Direct" },
	{ value: CandidateSource.VENDOR, label: "Vendor" },
	{ value: CandidateSource.PREVIOUS_WORKER, label: "Previous Worker" },
] as const satisfies readonly { value: CandidateSource; label: string }[];

/** Vendor portal lifecycle for vendor-owned candidates (aggregated from isActive + inviteStatus). */
export enum VendorCandidatePortalStatus {
	ACTIVE = "ACTIVE",
	ONBOARDING = "ONBOARDING",
	INACTIVE = "INACTIVE",
}

export const VENDOR_CANDIDATE_PORTAL_STATUS_OPTIONS = [
	{
		value: VendorCandidatePortalStatus.ACTIVE,
		label: "Active",
	},
	{
		value: VendorCandidatePortalStatus.ONBOARDING,
		label: "Onboarding",
	},
	{
		value: VendorCandidatePortalStatus.INACTIVE,
		label: "Inactive",
	},
] as const satisfies readonly {
	value: VendorCandidatePortalStatus;
	label: string;
}[];

/**
 * Match bucket for vendor job board lists when the candidate has no submission on the requisition yet.
 */
export enum VendorCandidateJobBoardMatchTier {
	STRONG = "STRONG",
	GOOD = "GOOD",
	REVIEW = "REVIEW",
}

export enum WorkforceBucket {
	INTERNAL = "INTERNAL",
	EXTERNAL = "EXTERNAL",
}

export const INTERNAL_WORKFORCE_TYPES = [
	CandidateWorkforceType.INTERNAL_FULL_TIME,
	CandidateWorkforceType.INTERNAL_PART_TIME,
	CandidateWorkforceType.INTERNAL_PRN,
	CandidateWorkforceType.INTERNAL_FLOAT_POOL,
	CandidateWorkforceType.INTERNAL_VOLUNTEER,
] as const satisfies readonly CandidateWorkforceType[];

export const EXTERNAL_WORKFORCE_TYPES = [
	CandidateWorkforceType.EXTERNAL_1099,
	CandidateWorkforceType.EXTERNAL_EOR,
	CandidateWorkforceType.EXTERNAL_VENDOR_LTO,
	CandidateWorkforceType.EXTERNAL_VENDOR_PER_DIEM,
] as const satisfies readonly CandidateWorkforceType[];

export const ALL_WORKFORCE_TYPES = [
	...INTERNAL_WORKFORCE_TYPES,
	...EXTERNAL_WORKFORCE_TYPES,
] as const satisfies readonly CandidateWorkforceType[];

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

export const VENDOR_CANDIDATE_WORKFORCE_TYPE_OPTIONS = [
	{
		value: VendorCandidateWorkforceType.EXTERNAL_1099,
		label: "External- 1099",
	},
	{
		value: VendorCandidateWorkforceType.EXTERNAL_EOR,
		label: "External- EOR",
	},
	{
		value: VendorCandidateWorkforceType.EXTERNAL_VENDOR_PER_DIEM,
		label: "External- Vendor Per Diem",
	},
	{
		value: VendorCandidateWorkforceType.EXTERNAL_VENDOR_LTO,
		label: "External- Vendor LTO",
	},
] as const satisfies readonly {
	value: VendorCandidateWorkforceType;
	label: string;
}[];

export function isInternalWorkforceType(
	workforceType: string | null | undefined,
): boolean {
	if (!workforceType) return false;
	return (INTERNAL_WORKFORCE_TYPES as readonly string[]).includes(
		workforceType,
	);
}

export function getWorkforceBucket(
	workforceType: string | null | undefined,
): WorkforceBucket | null {
	if (!workforceType) return null;
	if ((INTERNAL_WORKFORCE_TYPES as readonly string[]).includes(workforceType))
		return WorkforceBucket.INTERNAL;
	if ((EXTERNAL_WORKFORCE_TYPES as readonly string[]).includes(workforceType))
		return WorkforceBucket.EXTERNAL;
	return null;
}
