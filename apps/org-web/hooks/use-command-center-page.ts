"use client";

import {
	COMMAND_CENTER_TAB_CONDITIONS,
	type TabAbilityCheck,
} from "@repo/casl";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { useMemo } from "react";
import { ACTIVE_WORKFORCE_PARAMS } from "./use-active-workforce";
import { SHIFT_TAB_PARAMS } from "./use-command-center-shifts-tab";
import { HIRING_FUNNEL_PARAMS } from "./use-hiring-funnel";
import { OPS_PARAMS } from "./use-operations-management-filters";
import { PERFORMANCE_PARAMS } from "./use-performance-metrics";

export const COMMAND_CENTER_TAB_ORDER = [
	"operations-management",
	"performance",
	"hiring-funnel",
	"active-workforce",
	"shifts",
] as const;

export type CommandCenterTabValue = (typeof COMMAND_CENTER_TAB_ORDER)[number];

export const COMMAND_CENTER_TAB_CHECKS: Record<
	CommandCenterTabValue,
	TabAbilityCheck
> = {
	"operations-management": {
		subject: "CommandCenter",
		conditions: COMMAND_CENTER_TAB_CONDITIONS["operations-management"],
	},
	performance: {
		subject: "CommandCenter",
		conditions: COMMAND_CENTER_TAB_CONDITIONS.performance,
	},
	"hiring-funnel": {
		subject: "CommandCenter",
		conditions: COMMAND_CENTER_TAB_CONDITIONS["hiring-funnel"],
	},
	"active-workforce": {
		subject: "CommandCenter",
		conditions: COMMAND_CENTER_TAB_CONDITIONS["active-workforce"],
	},
	shifts: {
		subject: "CommandCenter",
		conditions: COMMAND_CENTER_TAB_CONDITIONS.shifts,
	},
};

export function useCommandCenterPage(allowedTabs: CommandCenterTabValue[]) {
	const orderedAllowed = useMemo(
		() => COMMAND_CENTER_TAB_ORDER.filter((t) => allowedTabs.includes(t)),
		[allowedTabs],
	);

	const [tab, handleTabChange] = useTabSwitch(
		orderedAllowed.length > 0 ? orderedAllowed : ["operations-management"],
		{
			alsoClearParamKeys: [
				OPS_PARAMS.FILTER,
				OPS_PARAMS.PAGE,
				OPS_PARAMS.LIMIT,
				PERFORMANCE_PARAMS.RANGE,
				PERFORMANCE_PARAMS.START_DATE,
				PERFORMANCE_PARAMS.END_DATE,
				HIRING_FUNNEL_PARAMS.SEARCH,
				HIRING_FUNNEL_PARAMS.LOCATION,
				HIRING_FUNNEL_PARAMS.DEPARTMENT,
				ACTIVE_WORKFORCE_PARAMS.OCCUPATION,
				SHIFT_TAB_PARAMS.SEARCH,
				SHIFT_TAB_PARAMS.DEPARTMENT,
				SHIFT_TAB_PARAMS.OCCUPATION,
			],
		},
	);

	const activeTab = orderedAllowed.length > 0 ? tab : undefined;

	return { activeTab, handleTabChange, orderedAllowed };
}
