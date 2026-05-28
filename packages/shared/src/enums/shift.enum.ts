/** Mirrors Prisma `ShiftType`. Keep synchronized with schema.prisma. */
export enum ShiftType {
	DAY = "DAY",
	EVENING = "EVENING",
	NIGHT = "NIGHT",
	ROTATING = "ROTATING",
	FLEXIBLE = "FLEXIBLE",
}

/** Mirrors Prisma `DelayUnit`. Keep synchronized with schema.prisma. */
export enum DelayUnit {
	HOURS = "HOURS",
	MINUTES = "MINUTES",
	DAYS = "DAYS",
}

/** Mirrors Prisma `PerDiemShiftStatus`. Keep synchronized with schema.prisma. */
export enum PerDiemShiftStatus {
	OPEN = "OPEN",
	IN_PROGRESS = "IN_PROGRESS",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
	EXPIRED = "EXPIRED",
}

export const SHIFT_TYPE_OPTIONS = [
	{ value: ShiftType.DAY, label: "Day Shift" },
	{ value: ShiftType.EVENING, label: "Evening Shift" },
	{ value: ShiftType.NIGHT, label: "Night Shift" },
	{ value: ShiftType.ROTATING, label: "Rotating Shift" },
	{ value: ShiftType.FLEXIBLE, label: "Flexible" },
] as const satisfies readonly { value: ShiftType; label: string }[];

/** Tuple for Zod `z.enum(…)`. */
export const SHIFT_TYPE_SCHEMA_VALUES = [
	ShiftType.DAY,
	ShiftType.EVENING,
	ShiftType.NIGHT,
	ShiftType.ROTATING,
	ShiftType.FLEXIBLE,
] as const satisfies readonly ShiftType[];
