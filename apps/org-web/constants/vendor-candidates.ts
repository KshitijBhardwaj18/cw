import type { VendorCandidateStatus } from "@/types/vendor-candidates";

export const VENDOR_CANDIDATE_STATUS = {
	ACTIVE: "ACTIVE",
	ONBOARDING: "ONBOARDING",
	INACTIVE: "INACTIVE",
} as const satisfies Record<string, VendorCandidateStatus>;

export const VENDOR_CANDIDATE_STATUS_FILTER_OPTIONS = [
	{ value: "all", label: "All Statuses" },
	{ value: VENDOR_CANDIDATE_STATUS.ACTIVE, label: "Active" },
	{ value: VENDOR_CANDIDATE_STATUS.ONBOARDING, label: "Onboarding" },
	{ value: VENDOR_CANDIDATE_STATUS.INACTIVE, label: "Inactive" },
];
