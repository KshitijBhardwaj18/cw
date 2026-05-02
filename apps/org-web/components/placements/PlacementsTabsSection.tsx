"use client";

import { Badge } from "@repo/ui/components/badge";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import type { PlacementTabCounts, PlacementTabValue } from "@/types/placements";
import {
	PlacementsTableCard,
	type PlacementsTableCardProps,
} from "./PlacementsTableCard";
import { PLACEMENT_TAB_ITEMS } from "./placement-tabs-config";

export type PlacementsTabsSectionProps = {
	activeTab: PlacementTabValue;
	onTabChange: (value: string) => void;
	tabCounts: PlacementTabCounts;
	table: PlacementsTableCardProps;
};

export function PlacementsTabsSection({
	activeTab,
	onTabChange,
	tabCounts,
	table,
}: PlacementsTabsSectionProps) {
	return (
		<Tabs
			value={activeTab}
			onValueChange={onTabChange}
			className="w-full flex-col space-y-6"
		>
			<ScrollableLineTabsRow>
				<TabsList
					variant="line"
					className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
				>
					{PLACEMENT_TAB_ITEMS.map(
						({ value, label, shortLabel, icon: Icon, countKey }) => {
							const count = tabCounts[countKey];
							return (
								<TabsTrigger key={value} value={value} className="flex-none">
									<Icon className="size-4 shrink-0" />
									<span className="max-sm:hidden">{label}</span>
									<span className="sm:hidden">{shortLabel}</span>
									<Badge variant="inactive" className="tabular-nums">
										{count}
									</Badge>
								</TabsTrigger>
							);
						},
					)}
				</TabsList>
			</ScrollableLineTabsRow>

			{PLACEMENT_TAB_ITEMS.map(({ value }) => (
				<TabsContent key={value} value={value} className="space-y-6">
					<PlacementsTableCard
						key={`${value}-${table.totalFiltered}`}
						{...table}
					/>
				</TabsContent>
			))}
		</Tabs>
	);
}
