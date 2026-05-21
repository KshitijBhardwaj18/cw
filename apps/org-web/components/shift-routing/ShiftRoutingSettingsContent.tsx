"use client";

import { Action, useAbility } from "@repo/casl";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { ArrowUpDown, Clock } from "lucide-react";
import { useOrgContext } from "@/contexts/org-context";
import { useShiftRoutingSettingsSuspense } from "@/queries/shift-routing.queries";
import { RoutingDelayTab } from "./RoutingDelayTab";
import { RoutingOrderTab } from "./RoutingOrderTab";

export function ShiftRoutingSettingsContent() {
	const ability = useAbility();
	const canEditShiftRouting = ability.can(
		Action.Update,
		"ShiftRoutingSettings",
	);
	const { id: orgId } = useOrgContext();
	const { data } = useShiftRoutingSettingsSuspense(orgId);

	const [activeTab, setActiveTab] = useTabSwitch(["order", "delay"]);

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Shift Routing Settings"
				total={data.tiers.length}
				itemLabel="tier"
				itemLabelPlural="tiers"
				description="Configure how shifts are routed to workforce types and set delay intervals between tiers"
			/>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="flex w-full flex-col gap-4"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						<TabsTrigger
							value="order"
							className="flex flex-none items-center gap-2 rounded-none border-0 px-5 py-3"
						>
							<ArrowUpDown className="size-4" />
							Routing Order
						</TabsTrigger>
						<TabsTrigger
							value="delay"
							className="flex flex-none items-center gap-2 rounded-none border-0 px-5 py-3"
						>
							<Clock className="size-4" />
							Routing Delay
						</TabsTrigger>
					</TabsList>
				</ScrollableLineTabsRow>

				<TabsContent value="order">
					<RoutingOrderTab
						orgId={orgId}
						tiers={data.tiers}
						readOnly={!canEditShiftRouting}
					/>
				</TabsContent>

				<TabsContent value="delay">
					<RoutingDelayTab
						orgId={orgId}
						settings={data.settings}
						tiers={data.tiers}
						readOnly={!canEditShiftRouting}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
