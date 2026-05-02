export const ORG_JOBS_STATUS_FILTER_OPTIONS = [
	{ value: "all", label: "All Statuses" },
	{ value: "OPEN", label: "Open" },
	{ value: "OFFER_ACCEPTED", label: "Offer Accepted" },
	{ value: "FILLED", label: "Filled" },
	{ value: "DRAFT", label: "Draft" },
	{ value: "CLOSED", label: "Closed" },
] as const;

export const ORG_JOBS_SHIFT_FILTER_TO_SHIFT_TYPE: Record<
	string,
	"DAYS" | "NIGHTS" | "EVENINGS" | "ROTATING" | "WEEKENDS_ONLY" | undefined
> = {
	all: undefined,
	day: "DAYS",
	night: "NIGHTS",
	evening: "EVENINGS",
	rotating: "ROTATING",
	weekend: "WEEKENDS_ONLY",
};

export const ORG_JOBS_SHIFT_FILTER_OPTIONS = [
	{ value: "all", label: "All Shifts / Types" },
	{ value: "day", label: "Day" },
	{ value: "night", label: "Night" },
	{ value: "evening", label: "Evening" },
	{ value: "rotating", label: "Rotating" },
	{ value: "weekend", label: "Weekend" },
	{ value: "permanent", label: "Permanent role" },
] as const;
