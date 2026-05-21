"use client";

import { Button } from "@repo/ui/components/button";
import { TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { Plus, Upload } from "lucide-react";
import { useState } from "react";
import { useMspOptions } from "@/queries";
import BulkImportPlatformUsers from "./BulkImportPlatformUsers";
import { UserFormDialog } from "./UserFormDialog";

interface UsersHeaderProps {
	activeTab: string;
}

const TAB_ITEMS: Array<{ key: string; label: string }> = [
	{ key: "platform", label: "Program Users" },
	{ key: "vendor", label: "Vendor Users" },
	{ key: "organization", label: "Organization Users" },
];

const UsersHeader = ({ activeTab }: UsersHeaderProps) => {
	const { data: mspOptions } = useMspOptions();
	const [isUserFormDialogOpen, setIsUserFormDialogOpen] = useState(false);
	const [isImportUserDialogOpen, setIsImportUserDialogOpen] = useState(false);

	return (
		<div className="flex flex-col gap-3 border-b sm:flex-row sm:items-end sm:justify-between">
			<ScrollableLineTabsRow
				underline={false}
				className="border-b-0 min-w-0 w-full sm:flex-1"
			>
				<TabsList variant="line" className="border-0 p-0">
					{TAB_ITEMS.map((tab) => (
						<TabsTrigger
							key={tab.key}
							value={tab.key}
							className="flex-none py-2.5 px-2.5 text-base font-normal"
						>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
			</ScrollableLineTabsRow>

			{activeTab === "platform" && (
				<div className="flex w-full flex-wrap items-stretch gap-2 pb-2 sm:w-auto sm:justify-end">
					<Button
						variant="outline"
						className="min-w-0 flex-1 sm:flex-initial"
						onClick={() => setIsImportUserDialogOpen(true)}
					>
						<Upload />
						Import User
					</Button>
					<Button
						className="min-w-0 flex-1 sm:flex-initial"
						onClick={() => setIsUserFormDialogOpen(true)}
					>
						<Plus />
						Add User
					</Button>
				</div>
			)}
			<BulkImportPlatformUsers
				open={isImportUserDialogOpen}
				onOpenChange={setIsImportUserDialogOpen}
			/>
			<UserFormDialog
				open={isUserFormDialogOpen}
				onOpenChange={setIsUserFormDialogOpen}
				mspOptions={mspOptions ?? []}
			/>
		</div>
	);
};

export default UsersHeader;
