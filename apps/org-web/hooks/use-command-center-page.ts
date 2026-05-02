"use client";

import {
	COMMAND_CENTER_TAB_CONDITIONS,
	type TabAbilityCheck,
} from "@repo/casl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

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
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const orderedAllowed = useMemo(
		() => COMMAND_CENTER_TAB_ORDER.filter((t) => allowedTabs.includes(t)),
		[allowedTabs],
	);

	const tabParam = searchParams.get("tab");

	const activeTab = useMemo((): CommandCenterTabValue | undefined => {
		if (orderedAllowed.length === 0) {
			return undefined;
		}
		if (
			tabParam &&
			orderedAllowed.includes(tabParam as CommandCenterTabValue)
		) {
			return tabParam as CommandCenterTabValue;
		}
		return orderedAllowed[0];
	}, [tabParam, orderedAllowed]);

	useEffect(() => {
		if (orderedAllowed.length === 0) {
			return;
		}
		if (
			tabParam &&
			!orderedAllowed.includes(tabParam as CommandCenterTabValue)
		) {
			const next = orderedAllowed[0];
			if (next === "operations-management") {
				router.replace(pathname, { scroll: false });
			} else {
				router.replace(`${pathname}?tab=${next}`, { scroll: false });
			}
		}
	}, [tabParam, orderedAllowed, pathname, router]);

	const handleTabChange = useCallback(
		(nextTab: string) => {
			if (
				!COMMAND_CENTER_TAB_ORDER.includes(nextTab as CommandCenterTabValue)
			) {
				return;
			}
			if (!orderedAllowed.includes(nextTab as CommandCenterTabValue)) {
				return;
			}

			if (nextTab === "operations-management") {
				router.push(pathname, { scroll: false });
				return;
			}

			router.push(`${pathname}?tab=${nextTab}`, { scroll: false });
		},
		[pathname, orderedAllowed, router],
	);

	return {
		activeTab,
		handleTabChange,
		orderedAllowed,
	};
}
