import type { PrismaQuery } from "@casl/prisma";
import type { PlacementStatus } from "@repo/db";

export const PLACEMENT_UPCOMING_STATUSES: PlacementStatus[] = ["UPCOMING"];

export const PLACEMENT_ACTIVE_STATUSES: PlacementStatus[] = [
	"ACTIVE",
	"ON_HOLD",
];

export const PLACEMENT_COMPLETED_STATUSES: PlacementStatus[] = [
	"COMPLETED",
	"TERMINATED",
];

export const PLACEMENT_TAB_CONDITIONS = {
	upcoming: { status: { in: PLACEMENT_UPCOMING_STATUSES } },
	active: { status: { in: PLACEMENT_ACTIVE_STATUSES } },
	completed: { status: { in: PLACEMENT_COMPLETED_STATUSES } },
} as const satisfies Record<string, PrismaQuery>;

export type PlacementTabKey = keyof typeof PLACEMENT_TAB_CONDITIONS;
