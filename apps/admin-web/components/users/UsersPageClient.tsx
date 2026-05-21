"use client";

import { Alert } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Tabs, TabsContent } from "@repo/ui/components/tabs";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { usersKeys } from "@/queries/users.query";
import { useBulkPlatformUsersStore } from "@/stores/bulk-platform-users.store";
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
			{activeTab === "platform" && bulkPlatformUsersStatus.phase !== "idle" && (
				<Alert
					className="flex items-center justify-between gap-3 border-primary/40 bg-primary/4 px-4 py-3"
					variant={
						bulkPlatformUsersStatus.phase === "failed"
							? "destructive"
							: undefined
					}
				>
					<div className="flex min-w-0 flex-1 items-center gap-3">
						{bulkPlatformUsersStatus.phase === "processing" && (
							<>
								<Loader2 className="text-primary size-5 shrink-0 animate-spin" />
								<span className="text-foreground text-sm font-medium">
									Processing bulk import…
								</span>
							</>
						)}
						{bulkPlatformUsersStatus.phase === "completed" && (
							<span className="text-foreground text-sm">
								Bulk import complete. Created: {bulkPlatformUsersStatus.created}
								, Skipped: {bulkPlatformUsersStatus.skipped}, Failed:{" "}
								{bulkPlatformUsersStatus.failed}
								{bulkPlatformUsersStatus.errors &&
								bulkPlatformUsersStatus.errors.length > 0
									? ` (${bulkPlatformUsersStatus.errors.length} error details)`
									: ""}
							</span>
						)}
						{bulkPlatformUsersStatus.phase === "failed" && (
							<span className="text-sm">{bulkPlatformUsersStatus.message}</span>
						)}
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="shrink-0"
						onClick={dismissBulkPlatformUsers}
						aria-label="Dismiss"
					>
						<X className="size-4" />
					</Button>
				</Alert>
			)}
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
