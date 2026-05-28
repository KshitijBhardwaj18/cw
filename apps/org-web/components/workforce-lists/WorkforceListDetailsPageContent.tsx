"use client";

import { Button } from "@repo/ui/components/button";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { ArrowLeft, Download, Tag, UserPlus } from "lucide-react";
import Link from "next/link";
import { useWorkforceListMembersColumns } from "@/hooks/tables/use-workforce-list-members-columns";
import { useWorkforceListDetailsPage } from "@/hooks/use-workforce-list-details-page";
import { AddBulkTagDialog } from "./AddBulkTagDialog";
import { AddMembersToListDialog } from "./AddMembersToListDialog";
import { RemoveMemberConfirmationDialog } from "./RemoveMemberConfirmationDialog";

type WorkforceListDetailsPageContentProps = {
	listId: string;
};

export function WorkforceListDetailsPageContent({
	listId,
}: Readonly<WorkforceListDetailsPageContentProps>) {
	const {
		search,
		setSearch,
		bulkTagDialogOpen,
		setBulkTagDialogOpen,
		addMembersDialogOpen,
		setAddMembersDialogOpen,
		removeDialogOpen,
		setRemoveDialogOpen,
		memberToRemove,
		handleRemovePrompt,
		handleConfirmRemove,
		listData,
		filteredMembers,
		handleExportCsv,
		handleAddBulkTag,
		handleAddMembers,
		isRemovePending,
	} = useWorkforceListDetailsPage(listId);

	const columns = useWorkforceListMembersColumns({
		onRemove: handleRemovePrompt,
	});

	if (!listData) {
		return (
			<div className="space-y-6">
				<Button asChild variant="ghost" className="w-fit px-0">
					<Link href="/org/workforce-lists">
						<ArrowLeft className="size-4" />
						Back to Workforce Lists
					</Link>
				</Button>
				<div className="rounded-xl border p-6">
					<p className="font-semibold text-sm">Workforce list not found.</p>
					<p className="text-muted-foreground mt-1 text-sm">
						The selected list is unavailable.
					</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-6">
				<ConfigPageHeader
					title={listData.name}
					total={filteredMembers.length}
					itemLabel="member"
					itemLabelPlural="members"
					backLink={{ href: "/org/workforce-lists", label: "Back" }}
					description={listData.description}
					actions={[
						{
							key: "add-members",
							icon: <UserPlus className="size-4" />,
							label: "Add Members",
							onClick: () => setAddMembersDialogOpen(true),
						},
					]}
				/>

				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex-1">
						<SearchWithFilters
							searchPlaceholder="Search members by name, email, occupation, or tags..."
							searchValue={search}
							onSearchChange={setSearch}
							filtersExpanded={false}
							onFiltersExpandedChange={() => {}}
							filterConfigs={[]}
						/>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							onClick={() => setBulkTagDialogOpen(true)}
							className="h-10"
						>
							<Tag className="size-4" />
							Bulk Tag
						</Button>
						<Button
							variant="outline"
							onClick={handleExportCsv}
							className="h-10"
						>
							<Download className="size-4" />
							Export CSV
						</Button>
					</div>
				</div>

				<CustomTable
					data={filteredMembers}
					columns={columns}
					emptyState={
						<div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
							<p className="font-semibold text-sm">No members found</p>
							<p className="text-muted-foreground text-sm">
								Try a different search term.
							</p>
						</div>
					}
				/>
			</div>

			<AddBulkTagDialog
				open={bulkTagDialogOpen}
				onOpenChange={setBulkTagDialogOpen}
				listName={listData.name}
				onConfirm={handleAddBulkTag}
			/>

			<AddMembersToListDialog
				open={addMembersDialogOpen}
				onOpenChange={setAddMembersDialogOpen}
				listName={listData.name}
				listId={listData.id}
				onAdd={handleAddMembers}
			/>

			<RemoveMemberConfirmationDialog
				memberName={memberToRemove?.name ?? null}
				open={removeDialogOpen}
				onOpenChange={setRemoveDialogOpen}
				onConfirm={handleConfirmRemove}
				isPending={isRemovePending}
			/>
		</>
	);
}
