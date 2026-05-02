"use client";

import { Alert } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usersKeys } from "@/queries/users.query";
import { useBulkPlatformUsersStore } from "@/stores/bulk-platform-users.store";
import OrganizationUsers from "./OrganizationUsers";
import PlatformUsers from "./PlatformUsers";
import UsersHeader from "./UsersHeader";
import VendorUsers from "./VendorUsers";

const TABS = {
	platform: PlatformUsers,
	vendor: VendorUsers,
	organization: OrganizationUsers,
};

const UsersPageClient = () => {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<
		"platform" | "vendor" | "organization"
	>("platform");
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

	const Component = TABS[activeTab];
	return (
		<div className="flex flex-col gap-4">
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
			<UsersHeader activeTab={activeTab} setActiveTab={setActiveTab} />
			<Component />
		</div>
	);
};

export default UsersPageClient;
