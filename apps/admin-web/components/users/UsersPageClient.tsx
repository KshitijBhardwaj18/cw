"use client";

import { Tabs, TabsContent } from "@repo/ui/components/tabs";
import { BulkJobAlert } from "@repo/ui/general/BulkJobAlert";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { usersKeys } from "@/queries/users.query";
import { useBulkPlatformUsersStore } from "@/stores/bulk-platform-users.store";
import { toBulkPlatformUsersAlertStatus } from "@/utils/bulk-job-banner";
import OrganizationUsers, { OU_PARAMS } from "./OrganizationUsers";
import PlatformUsers, { PU_PARAMS } from "./PlatformUsers";
import UsersHeader from "./UsersHeader";
import VendorUsers, { VU_PARAMS } from "./VendorUsers";

const UsersPageClient = () => {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useTabSwitch(
		["platform", "vendor", "organization"],
		{
			alsoClearParamKeys: [
				PU_PARAMS.SEARCH,
				VU_PARAMS.SEARCH,
				OU_PARAMS.SEARCH,
			],
		},
	);
	const bulkPlatformUsersStatus = useBulkPlatformUsersStore((s) => s.status);
	const dismissBulkPlatformUsers = useBulkPlatformUsersStore((s) => s.dismiss);

	useEffect(() => {
		if (
			bulkPlatformUsersStatus.phase === "completed" ||
			bulkPlatformUsersStatus.phase === "failed"
		) {
			queryClient.invalidateQueries({ queryKey: usersKeys.program });
		}
	}, [bulkPlatformUsersStatus.phase, queryClient]);

	return (
		<Tabs
			value={activeTab}
			onValueChange={(v) => setActiveTab(v)}
			className="w-full flex-col space-y-4"
		>
			{activeTab === "platform" ? (
				<BulkJobAlert
					status={toBulkPlatformUsersAlertStatus(bulkPlatformUsersStatus)}
					onDismiss={dismissBulkPlatformUsers}
					errorsTitle="Bulk import errors"
				/>
			) : null}
			<UsersHeader activeTab={activeTab} />

			<TabsContent value="platform" className="mt-0">
				<PlatformUsers />
			</TabsContent>
			<TabsContent value="vendor" className="mt-0">
				<VendorUsers />
			</TabsContent>
			<TabsContent value="organization" className="mt-0">
				<OrganizationUsers />
			</TabsContent>
		</Tabs>
	);
};

export default UsersPageClient;
