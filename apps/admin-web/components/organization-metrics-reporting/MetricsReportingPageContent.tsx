"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { Calendar, LineChart } from "lucide-react";
import { AgingRulesTabContent } from "./AgingRulesTabContent";
import {
	METRICS_REPORTING_PARAMS,
	MetricsReportingKpisTabContent,
} from "./MetricsReportingKpisTabContent";

type MetricsReportingPageContentProps = {
	organizationId: string;
};

function MetricsReportingPageContent({
	organizationId,
}: MetricsReportingPageContentProps) {
	const [tab, setTab] = useTabSwitch(["kpis", "aging-rules"], {
		alsoClearParamKeys: [METRICS_REPORTING_PARAMS.SEARCH],
	});

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Metrics & Reporting"
				description="Monitor recruitment KPIs and configure aging rules for workflow stages."
				total={0}
				itemLabel=""
				itemLabelPlural=""
			/>

			<Tabs
				value={tab}
				onValueChange={setTab}
				className="w-full flex-col space-y-6"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						<TabsTrigger value="kpis" className="flex-none px-4 py-3">
							<LineChart className="size-4" />
							KPIs
						</TabsTrigger>
						<TabsTrigger value="aging-rules" className="flex-none px-4 py-3">
							<Calendar className="size-4" />
							Aging Rules
						</TabsTrigger>
					</TabsList>
				</ScrollableLineTabsRow>

				<TabsContent value="kpis" className="mt-0 space-y-6">
					<MetricsReportingKpisTabContent organizationId={organizationId} />
				</TabsContent>

				<TabsContent value="aging-rules" className="mt-0">
					<AgingRulesTabContent />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default MetricsReportingPageContent;
