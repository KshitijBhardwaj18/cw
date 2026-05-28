import {
	PerDiemShiftStatus,
	SHIFT_TYPE_OPTIONS,
	SHIFT_TYPE_SCHEMA_VALUES,
	ShiftType as ShiftTypeEnum,
} from "@repo/shared";

export type ShiftStatus = `${PerDiemShiftStatus}`;

/** String union matching Prisma `ShiftType` — use for rows, Zod, JSON. */
export type ShiftTypeKey = `${ShiftTypeEnum}`;
export type ShiftType = ShiftTypeKey;

export { PerDiemShiftStatus, SHIFT_TYPE_OPTIONS, ShiftTypeEnum };

/** Zod-compatible tuple matching Prisma `ShiftType`. */
export const SHIFT_TYPE_VALUES = SHIFT_TYPE_SCHEMA_VALUES;

export type ShiftStatCardItem = {
	key: ShiftStatus | "ALL";
	label: string;
	countClass: string;
	activeClass: string;
};

export interface ShiftTemplateItem {
	id: string;
	templateName: string;
	shiftType: ShiftTypeKey;
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
	shiftType: ShiftTypeKey;
	totalHours: number;
	totalCost: number;
	notifications: number;
	createdBy: string;
	createdAt: string;
	hasConflict: boolean;
	conflictReason: string | null;
}

export const STATUS_BADGE_CLASS: Record<ShiftStatus, string> = {
	[PerDiemShiftStatus.OPEN]:
		"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	[PerDiemShiftStatus.IN_PROGRESS]:
		"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	[PerDiemShiftStatus.COMPLETED]:
		"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	[PerDiemShiftStatus.CANCELLED]:
		"bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
	[PerDiemShiftStatus.EXPIRED]:
		"bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export const STATUS_LABEL: Record<ShiftStatus, string> = {
	[PerDiemShiftStatus.OPEN]: "Open",
	[PerDiemShiftStatus.IN_PROGRESS]: "In Progress",
	[PerDiemShiftStatus.COMPLETED]: "Completed",
	[PerDiemShiftStatus.CANCELLED]: "Cancelled",
	[PerDiemShiftStatus.EXPIRED]: "Expired",
};

export const SHIFT_TYPE_LABEL: Record<ShiftTypeKey, string> =
	Object.fromEntries(
		SHIFT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
	) as Record<ShiftTypeKey, string>;

export const SHIFT_TYPE_CLASS: Record<ShiftTypeKey, string> = {
	[ShiftTypeEnum.DAY]: "text-amber-600 dark:text-amber-400",
	[ShiftTypeEnum.EVENING]: "text-orange-600 dark:text-orange-400",
	[ShiftTypeEnum.NIGHT]: "text-violet-600 dark:text-violet-400",
	[ShiftTypeEnum.ROTATING]: "text-sky-600 dark:text-sky-400",
	[ShiftTypeEnum.FLEXIBLE]: "text-emerald-600 dark:text-emerald-400",
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
		key: PerDiemShiftStatus.OPEN,
		label: "Open",
		countClass: "text-blue-600 dark:text-blue-400",
		activeClass: "ring-2 ring-blue-500 border-blue-500",
	},
	{
		key: PerDiemShiftStatus.IN_PROGRESS,
		label: "In Progress",
		countClass: "text-amber-600 dark:text-amber-400",
		activeClass: "ring-2 ring-amber-500 border-amber-500",
	},
	{
		key: PerDiemShiftStatus.COMPLETED,
		label: "Completed",
		countClass: "text-green-600 dark:text-green-400",
		activeClass: "ring-2 ring-green-500 border-green-500",
	},
	{
		key: PerDiemShiftStatus.CANCELLED,
		label: "Cancelled",
		countClass: "text-gray-600 dark:text-gray-400",
		activeClass: "ring-2 ring-gray-500 border-gray-500",
	},
	{
		key: PerDiemShiftStatus.EXPIRED,
		label: "Expired",
		countClass: "text-slate-600 dark:text-slate-400",
		activeClass: "ring-2 ring-slate-500 border-slate-500",
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
