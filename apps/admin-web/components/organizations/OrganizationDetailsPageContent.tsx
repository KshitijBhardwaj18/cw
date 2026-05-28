"use client";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { LIST_FILTER_KEYS } from "@repo/ui/hooks/use-list-filters";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { useOrganization } from "@/queries/organizations.query";
import { OrganizationDocumentsTab } from "./OrganizationDocumentsTab";
import { OrganizationNotesTab } from "./OrganizationNotesTab";
import { OrganizationProfileDetails } from "./OrganizationProfileDetails";

type OrganizationDetailsPageContentProps = {
	organizationId: string;
};

export function OrganizationDetailsPageContent({
	organizationId,
}: Readonly<OrganizationDetailsPageContentProps>) {
	const [tab, setTab] = useTabSwitch(["profile", "documents", "notes"], {
		alsoClearParamKeys: LIST_FILTER_KEYS,
	});

	const { data: org } = useOrganization(organizationId);

	if (!org) {
		return null;
	}

	return (
		<Tabs
			value={tab}
			onValueChange={setTab}
			className="flex w-full flex-col gap-4"
		>
			<ScrollableLineTabsRow>
				<TabsList
					variant="line"
					className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
				>
					<TabsTrigger value="profile">Organization Profile</TabsTrigger>
					<TabsTrigger value="documents">Documents</TabsTrigger>
					<TabsTrigger value="notes">Notes</TabsTrigger>
				</TabsList>
			</ScrollableLineTabsRow>
			<TabsContent value="profile" className="space-y-6">
				<OrganizationProfileDetails key={org.id} organization={org} />
			</TabsContent>
			<TabsContent value="documents">
				<OrganizationDocumentsTab organizationId={organizationId} />
			</TabsContent>
			<TabsContent value="notes">
				<OrganizationNotesTab organizationId={organizationId} />
			</TabsContent>
		</Tabs>
	);
}
