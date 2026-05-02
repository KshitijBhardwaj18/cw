"use client";

import { filterReadableTabs, useAbility } from "@repo/casl";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import {
	AlertCircle,
	ChartColumn,
	type LucideIcon,
	MapPin,
	Target,
	UsersRound,
} from "lucide-react";
import { type ComponentType, useMemo } from "react";
import { AccessBlockedState } from "@/components/general/AccessBlockedState";
import {
	COMMAND_CENTER_TAB_CHECKS,
	COMMAND_CENTER_TAB_ORDER,
	type CommandCenterTabValue,
	useCommandCenterPage,
} from "@/hooks/use-command-center-page";
import { ActiveWorkforceTab } from "./tabs/ActiveWorkforceTab";
import { HiringFunnelTab } from "./tabs/HiringFunnelTab";
import { OperationsManagementTab } from "./tabs/OperationsManagementTab";
import { PerformanceTab } from "./tabs/PerformanceTab";
import { ShiftsTab } from "./tabs/ShiftsTab";

const TAB_CONFIG: {
	value: CommandCenterTabValue;
	label: string;
	icon: LucideIcon;
}[] = [
	{
		value: "operations-management",
		label: "Operations Management",
		icon: AlertCircle,
	},
	{
		value: "performance",
		label: "Performance",
		icon: ChartColumn,
	},
	{
		value: "hiring-funnel",
		label: "Hiring Funnel",
		icon: Target,
	},
	{
		value: "active-workforce",
		label: "Active Workforce",
		icon: UsersRound,
	},
	{ value: "shifts", label: "Shifts", icon: MapPin },
];

const TAB_CONTENT: Record<CommandCenterTabValue, ComponentType> = {
	"operations-management": OperationsManagementTab,
	performance: PerformanceTab,
	"hiring-funnel": HiringFunnelTab,
	"active-workforce": ActiveWorkforceTab,
	shifts: ShiftsTab,
};

const CommandCenterPageContent = () => {
	const ability = useAbility();

	const allowedTabs = useMemo(
		() =>
			filterReadableTabs(
				ability,
				COMMAND_CENTER_TAB_ORDER,
				COMMAND_CENTER_TAB_CHECKS,
			),
		[ability],
	);

	const { activeTab, handleTabChange } = useCommandCenterPage(allowedTabs);

	const visibleTabs = useMemo(
		() => TAB_CONFIG.filter((t) => allowedTabs.includes(t.value)),
		[allowedTabs],
	);

	if (allowedTabs.length === 0 || activeTab === undefined) {
		return (
			<div className="space-y-6">
				<ConfigPageHeader
					title="Command Center"
					total={0}
					itemLabel="insight"
					itemLabelPlural="insights"
					description="Real-time reporting and insights across your organization"
				/>
				<AccessBlockedState description="You do not have permission to view any Command Center areas for this organization." />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Command Center"
				total={0}
				itemLabel="insight"
				itemLabelPlural="insights"
				description="Real-time reporting and insights across your organization"
			/>

			<Tabs
				value={activeTab}
				onValueChange={handleTabChange}
				className="w-full flex-col space-y-6"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						{visibleTabs.map(({ value, label, icon: Icon }) => (
							<TabsTrigger
								key={value}
								value={value}
								className="flex flex-none items-center gap-2 rounded-none border-0 px-4 py-3"
							>
								<Icon className="size-4" />
								{label}
							</TabsTrigger>
						))}
					</TabsList>
				</ScrollableLineTabsRow>

				{visibleTabs.map(({ value }) => {
					const Panel = TAB_CONTENT[value];
					return (
						<TabsContent key={value} value={value} className="w-full">
							<Panel />
						</TabsContent>
					);
				})}
			</Tabs>
		</div>
	);
};

export default CommandCenterPageContent;
