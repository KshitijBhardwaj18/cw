export type ShiftStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ShiftType = "DAYS" | "NIGHTS" | "EVENINGS" | "SWING";
export type ShiftStatCardItem = {
	key: ShiftStatus | "ALL";
	label: string;
	countClass: string;
	activeClass: string;
};

export interface ShiftTemplateItem {
	id: string;
	templateName: string;
	shiftType: ShiftType;
	occupationId: string;
	departmentId: string;
	locationId: string;
	locationName: string;
	departmentName: string;
	baseRate: number;
	durationHours: number;
	occupationName: string;
	createdBy: string;
	createdAt: string;
}

export interface Shift {
	id: string;
	title: string;
	status: ShiftStatus;
	isPublic: boolean;
	date: string;
	timeRange: string;
	ratePerHour: number;
	occupation: string;
	specialty: string;
	department: string;
	location: string;
	claimedBy: string | null;
	claimedAt: string | null;
	vendorRatePerHour: number;
	shiftType: ShiftType;
	totalHours: number;
	totalCost: number;
	notifications: number;
	createdBy: string;
	createdAt: string;
}

export const SHIFT_TYPE_OPTIONS = [
	{ value: "DAYS", label: "Day" },
	{ value: "NIGHTS", label: "Night" },
	{ value: "EVENINGS", label: "Evening" },
	{ value: "SWING", label: "Swing" },
] as const;

export const SHIFT_TYPE_VALUES = [
	"DAYS",
	"NIGHTS",
	"EVENINGS",
	"SWING",
] as const;

export const STATUS_BADGE_CLASS: Record<ShiftStatus, string> = {
	OPEN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	IN_PROGRESS:
		"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	COMPLETED:
		"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	CANCELLED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export const STATUS_LABEL: Record<ShiftStatus, string> = {
	OPEN: "Open",
	IN_PROGRESS: "In Progress",
	COMPLETED: "Completed",
	CANCELLED: "Cancelled",
};

export const SHIFT_TYPE_CLASS: Record<ShiftType, string> = {
	DAYS: "text-amber-600 dark:text-amber-400",
	NIGHTS: "text-violet-600 dark:text-violet-400",
	EVENINGS: "text-orange-600 dark:text-orange-400",
	SWING: "text-sky-600 dark:text-sky-400",
};

export const SHIFT_TYPE_LABEL: Record<ShiftType, string> = {
	DAYS: "Day",
	NIGHTS: "Night",
	EVENINGS: "Evening",
	SWING: "Swing",
};

export const SHIFT_LIST_PAGE_SIZE = 5;
export const TEMPLATE_SELECTOR_PAGE_SIZE = 4;

export const SHIFT_STAT_CARDS: ShiftStatCardItem[] = [
	{
		key: "ALL",
		label: "All Shifts",
		countClass: "text-foreground",
		activeClass: "ring-2 ring-primary border-primary",
	},
	{
		key: "OPEN",
		label: "Open",
		countClass: "text-blue-600 dark:text-blue-400",
		activeClass: "ring-2 ring-blue-500 border-blue-500",
	},
	{
		key: "IN_PROGRESS",
		label: "In Progress",
		countClass: "text-amber-600 dark:text-amber-400",
		activeClass: "ring-2 ring-amber-500 border-amber-500",
	},
	{
		key: "COMPLETED",
		label: "Completed",
		countClass: "text-green-600 dark:text-green-400",
		activeClass: "ring-2 ring-green-500 border-green-500",
	},
];

export const WORKFORCE_TYPE_DESCRIPTIONS: Record<string, string> = {
	INTERNAL_FULL_TIME: "Full-time internal employees",
	INTERNAL_PART_TIME: "Part-time internal employees",
	INTERNAL_PRN: "On-call internal staff (PRN)",
	INTERNAL_FLOAT_POOL: "Float pool staff across departments",
	INTERNAL_VOLUNTEER: "Volunteer internal workforce",
	EXTERNAL_1099: "Independent contractors (1099)",
	EXTERNAL_EOR: "Employer of record external workers",
	EXTERNAL_VENDOR_PER_DIEM: "Per diem staff from external vendors",
	EXTERNAL_VENDOR_LTO: "Long-term order external vendor staff",
};

export const DELAY_UNIT_OPTIONS = [
	{ value: "MINUTES", label: "Minutes" },
	{ value: "HOURS", label: "Hours" },
	{ value: "DAYS", label: "Days" },
] as const;
