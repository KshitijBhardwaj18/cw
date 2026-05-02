"use client";

import { Button } from "@repo/ui/components/button";
import { Plus, Upload } from "lucide-react";
import { useState } from "react";
import { useMspOptions } from "@/queries";
import BulkImportPlatformUsers from "./BulkImportPlatformUsers";
import { UserFormDialog } from "./UserFormDialog";

type UsersTab = "platform" | "vendor" | "organization";

interface UsersHeaderProps {
	activeTab: UsersTab;
	setActiveTab: (tab: UsersTab) => void;
}

const TAB_ITEMS: Array<{ key: UsersTab; label: string }> = [
	{ key: "platform", label: "Program Users" },
	{ key: "vendor", label: "Vendor Users" },
	{ key: "organization", label: "Organization Users" },
];

const UsersHeader = ({ activeTab, setActiveTab }: UsersHeaderProps) => {
	const { data: mspOptions } = useMspOptions();
	const [isUserFormDialogOpen, setIsUserFormDialogOpen] = useState(false);
	const [isImportUserDialogOpen, setIsImportUserDialogOpen] = useState(false);

	return (
		<div className="flex items-end justify-between border-b">
			<div className="flex items-center gap-4">
				{TAB_ITEMS.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActiveTab(tab.key)}
						className={`border-b-2 px-1 py-2 transition-colors ${
							activeTab === tab.key
								? "border-primary text-foreground"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{activeTab === "platform" && (
				<div className="flex items-center gap-2 pb-2">
					<Button
						variant="outline"
						onClick={() => setIsImportUserDialogOpen(true)}
					>
						<Upload />
						Import User
					</Button>
					<Button onClick={() => setIsUserFormDialogOpen(true)}>
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
