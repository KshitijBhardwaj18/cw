import {
	CANDIDATE_SOURCE_OPTIONS,
	getLabel,
	SUBMISSION_STAGE_OPTIONS,
} from "@repo/shared";
import type { AddExistingTalentStatusValue } from "@/types/talent-community-add-existing";

export function getAddExistingTalentStatusLabel(
	status: AddExistingTalentStatusValue,
): string {
	if (status === "INACTIVE") return "Inactive";
	return getLabel(SUBMISSION_STAGE_OPTIONS, status);
}

export const ADD_EXISTING_STATUS_FILTER_OPTIONS: {
	value: string;
	label: string;
}[] = [
	{ value: "all", label: "All Statuses" },
	{ value: "INACTIVE", label: "Inactive" },
	...SUBMISSION_STAGE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
];

export const ADD_EXISTING_SOURCE_FILTER_OPTIONS: {
	value: string;
	label: string;
}[] = [
	{ value: "all", label: "All Sources" },
	...CANDIDATE_SOURCE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
];
