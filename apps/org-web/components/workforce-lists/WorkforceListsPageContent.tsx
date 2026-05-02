"use client";

import { Action, useAbility } from "@repo/casl";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { Plus, Users } from "lucide-react";
import { useWorkforceListsPage } from "@/hooks/use-workforce-lists-page";
import { CreateWorkforceListDialog } from "./CreateWorkforceListDialog";
import { WorkforceListCard } from "./WorkforceListCard";
import { WorkforceListDeleteDialog } from "./WorkforceListDeleteDialog";

export function WorkforceListsPageContent() {
	const ability = useAbility();
	const canCreateList = ability.can(Action.Create, "WorkforceLists");
	const canDeleteList = ability.can(Action.Delete, "WorkforceLists");

	const {
		createDialogOpen,
		setCreateDialogOpen,
		filteredLists,
		paginatedLists,
		currentPage,
		setCurrentPage,
		totalPages,
		search,
		setSearch,
		deleteDialogOpen,
		setDeleteDialogOpen,
		listToDelete,
		handleCreateList,
		handleConfirmDelete,
		handleDeletePrompt,
		isLoading,
		isDeletePending,
	} = useWorkforceListsPage();

	return (
		<>
			<div className="space-y-6">
				<ConfigPageHeader
					title="Workforce Lists"
					total={filteredLists.length}
					itemLabel="list"
					itemLabelPlural="lists"
					description="Organize your workforce into custom lists for better tracking and management."
					actions={
						canCreateList
							? [
									{
										key: "create-list",
										icon: <Plus className="size-4" />,
										label: "Create List",
										onClick: () => setCreateDialogOpen(true),
									},
								]
							: []
					}
				/>

				<SearchWithFilters
					searchPlaceholder="Search lists..."
					searchValue={search}
					onSearchChange={setSearch}
					filtersExpanded={false}
					onFiltersExpandedChange={() => {}}
					filterConfigs={[]}
				/>

				{isLoading ? (
					<div className="grid grid-cols-1 gap-6 xl:grid-cols-3 lg:grid-cols-2">
						{[...Array(6)].map((_, i) => (
							<Skeleton key={i} className="h-36 w-full rounded-xl" />
						))}
					</div>
				) : filteredLists.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
						<Users className="size-12 text-muted-foreground" />
						<p className="my-2 font-semibold text-sm text-muted-foreground">
							No workforce lists created yet
						</p>
						{canCreateList && (
							<Button
								variant="link"
								onClick={() => setCreateDialogOpen(true)}
								size="sm"
							>
								Create Your first list
							</Button>
						)}
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 gap-6 xl:grid-cols-3 lg:grid-cols-2">
							{paginatedLists.map((list) => (
								<WorkforceListCard
									key={list.id}
									list={list}
									canDelete={canDeleteList}
									onDelete={() => handleDeletePrompt(list)}
								/>
							))}
						</div>
						<ConfigPagePagination
							page={currentPage}
							totalPages={totalPages}
							onPageChange={setCurrentPage}
						/>
					</>
				)}
			</div>

			<CreateWorkforceListDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				onCreate={handleCreateList}
			/>

			<WorkforceListDeleteDialog
				list={listToDelete}
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleConfirmDelete}
				isPending={isDeletePending}
			/>
		</>
	);
}
