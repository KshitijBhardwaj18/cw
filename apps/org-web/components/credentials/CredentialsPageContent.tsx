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
import { AlertTriangle, Calendar } from "lucide-react";
import { CRED_PARAMS } from "@/hooks/use-credential-filters";
import { UPCOMING_PLACEMENTS_PARAMS } from "@/hooks/use-upcoming-placements";
import { CredentialsTabContent } from "./CredentialsTabContent";
import { UpcomingPlacementsTabContent } from "./UpcomingPlacementsTabContent";

const CredentialsPageContent = () => {
	const [activeTab, setActiveTab] = useTabSwitch(
		["credentials", "upcoming-placements"],
		{
			alsoClearParamKeys: [
				CRED_PARAMS.PAGE,
				CRED_PARAMS.SEARCH,
				CRED_PARAMS.LIMIT,
				CRED_PARAMS.LOCATION,
				CRED_PARAMS.DEPARTMENT,
				CRED_PARAMS.VENDOR,
				CRED_PARAMS.HIRING_MANAGER,
				CRED_PARAMS.STATUS,
				UPCOMING_PLACEMENTS_PARAMS.PAGE,
				UPCOMING_PLACEMENTS_PARAMS.SEARCH,
				UPCOMING_PLACEMENTS_PARAMS.LIMIT,
				UPCOMING_PLACEMENTS_PARAMS.LOCATION,
				UPCOMING_PLACEMENTS_PARAMS.DEPARTMENT,
				UPCOMING_PLACEMENTS_PARAMS.VENDOR,
				UPCOMING_PLACEMENTS_PARAMS.HIRING_MANAGER,
				UPCOMING_PLACEMENTS_PARAMS.STATUS,
			],
		},
	);

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Compliance Tracking"
				total={0}
				itemLabel="credential"
				itemLabelPlural="credentials"
				description="Monitor credential expiration and pre-placement compliance readiness"
			/>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full flex-col space-y-6"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						<TabsTrigger
							value="credentials"
							className="flex flex-none items-center gap-2 rounded-none border-0 px-4 py-3"
						>
							<AlertTriangle className="size-4" />
							Credentials
						</TabsTrigger>
						<TabsTrigger
							value="upcoming-placements"
							className="flex flex-none items-center gap-2 rounded-none border-0 px-4 py-3"
						>
							<Calendar className="size-4" />
							Upcoming Placements
						</TabsTrigger>
					</TabsList>
				</ScrollableLineTabsRow>

				<TabsContent value="credentials" className=" w-full">
					<CredentialsTabContent />
				</TabsContent>
				<TabsContent value="upcoming-placements" className=" w-full">
					<UpcomingPlacementsTabContent />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default CredentialsPageContent;
