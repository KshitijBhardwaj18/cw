import type { ShiftTypeKey } from "@/constants/shifts";

export const ORG_JOBS_STATUS_FILTER_OPTIONS = [
	{ value: "all", label: "All Statuses" },
	{ value: "OPEN", label: "Open" },
	{ value: "FILLED", label: "Filled" },
	{ value: "DRAFT", label: "Draft" },
	{ value: "CANCELLED", label: "Cancelled" },
] as const;

export const ORG_JOBS_SHIFT_FILTER_TO_SHIFT_TYPE: Record<
	string,
	ShiftTypeKey | undefined
> = {
	all: undefined,
	day: "DAY",
	evening: "EVENING",
	night: "NIGHT",
	rotating: "ROTATING",
	flexible: "FLEXIBLE",
};

export const ORG_JOBS_SHIFT_FILTER_OPTIONS = [
	{ value: "all", label: "All Shifts / Types" },
	{ value: "day", label: "Day Shift" },
	{ value: "evening", label: "Evening Shift" },
	{ value: "night", label: "Night Shift" },
	{ value: "rotating", label: "Rotating Shift" },
	{ value: "flexible", label: "Flexible" },
	{ value: "permanent", label: "Permanent role" },
] as const;
