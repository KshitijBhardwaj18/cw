import {
	VENDOR_CANDIDATE_PORTAL_STATUS_OPTIONS,
	VendorCandidatePortalStatus,
} from "@repo/shared";

export const VENDOR_CANDIDATE_STATUS = {
	ACTIVE: VendorCandidatePortalStatus.ACTIVE,
	ONBOARDING: VendorCandidatePortalStatus.ONBOARDING,
	INACTIVE: VendorCandidatePortalStatus.INACTIVE,
} as const satisfies Record<string, VendorCandidatePortalStatus>;

export const VENDOR_CANDIDATE_STATUS_FILTER_OPTIONS = [
	{ value: "all", label: "All Statuses" },
	...VENDOR_CANDIDATE_PORTAL_STATUS_OPTIONS.map((o) => ({
		value: o.value,
		label: o.label,
	})),
];
