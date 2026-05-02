import type { PrismaQuery } from "@casl/prisma";
import type { AppSubjects } from "../types/subjects";

export const COMMAND_CENTER_ROUTE: AppSubjects = "CommandCenter";

export const COMMAND_CENTER_TABS = [
	"metrics",
	"shifts",
	"operations-management",
	"performance",
	"hiring-funnel",
	"active-workforce",
] as const;

export type CommandCenterTab = (typeof COMMAND_CENTER_TABS)[number];

export const COMMAND_CENTER_TAB_CONDITIONS = {
	metrics: { tab: "metrics" },
	shifts: { tab: "shifts" },
	"operations-management": { tab: "operations-management" },
	performance: { tab: "performance" },
	"hiring-funnel": { tab: "hiring-funnel" },
	"active-workforce": { tab: "active-workforce" },
} as const satisfies Record<CommandCenterTab, PrismaQuery>;
