"use client";

import { Action, useAbility } from "@repo/casl";
import { Button } from "@repo/ui/components/button";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { FolderOpen, Plus } from "lucide-react";
import { useProjectsPage } from "@/hooks/use-projects-page";
import { ProjectCard } from "./ProjectCard";
import { ProjectDeleteDialog } from "./ProjectDeleteDialog";
import { ProjectFormDialog } from "./ProjectFormDialog";

export function ProjectsPageContent() {
	const ability = useAbility();
	const canCreateProject = ability.can(Action.Create, "Project");

	const {
		search,
		setSearch,
		status,
		setStatus,
		createOpen,
		setCreateOpen,
		editTarget,
		setEditTarget,
		deleteOpen,
		setDeleteOpen,
		projectToDelete,
		filtersExpanded,
		setFiltersExpanded,
		filteredCount,
		paginatedProjects,
		currentPage,
		setCurrentPage,
		limit,
		setLimit,
		pageSizeOptions,
		totalPages,
		filterConfigs,
		handleCreateProject,
		handleUpdateProject,
		handleDeletePrompt,
		handleConfirmDelete,
		isError,
		listErrorMessage,
		refetchList,
		createPending,
		updatePending,
		deletePending,
	} = useProjectsPage();

	const showFatalListError = isError && filteredCount === 0;
	const hasListFilters = Boolean(search.trim() || status !== "all");

	return (
		<>
			<div className="space-y-6">
				<ConfigPageHeader
					title="Projects"
					total={filteredCount}
					itemLabel="project"
					itemLabelPlural="projects"
					description="Group and organize your requisitions into projects for better tracking."
					countText={showFatalListError ? listErrorMessage : undefined}
					actions={
						canCreateProject
							? [
									{
										key: "create-project",
										icon: <Plus className="size-4" />,
										label: "Create Project",
										onClick: () => setCreateOpen(true),
									},
								]
							: []
					}
				/>

				<SearchWithFilters
					searchPlaceholder="Search projects..."
					searchValue={search}
					onSearchChange={setSearch}
					filtersExpanded={filtersExpanded}
					onFiltersExpandedChange={(expanded) => {
						setFiltersExpanded(expanded);
						if (!expanded) setStatus("all");
					}}
					filterConfigs={filterConfigs}
				/>

				{showFatalListError ? (
					<ConfigPageErrorState
						className="rounded-xl border border-dashed py-16"
						title="Could not load projects"
						description={listErrorMessage}
						action={
							<Button variant="outline" onClick={refetchList}>
								Try again
							</Button>
						}
					/>
				) : filteredCount === 0 ? (
					<ConfigPageEmptyState
						hasSearch={hasListFilters}
						searchEmptyTitle="No projects found"
						emptyTitle="No projects created yet"
						searchEmptyMessage="Try adjusting search or filters."
						emptyMessage="No projects in this view yet. Create a project to group requisitions."
						icon={FolderOpen}
						action={
							canCreateProject ? (
								<Button
									variant="link"
									className="h-auto p-0"
									onClick={() => setCreateOpen(true)}
								>
									Create your first project
								</Button>
							) : null
						}
					/>
				) : (
					<>
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
							{paginatedProjects.map((project) => (
								<ProjectCard
									key={project.id}
									project={project}
									onEdit={setEditTarget}
									onDelete={() => handleDeletePrompt(project)}
								/>
							))}
						</div>
						<PaginationControls
							currentPage={currentPage}
							pageCount={totalPages}
							goToPage={setCurrentPage}
							limit={limit}
							setLimit={setLimit}
							pageSizeOptions={pageSizeOptions}
							totalItems={filteredCount}
							itemLabel="project"
							itemLabelPlural="projects"
						/>
					</>
				)}
			</div>

			<ProjectFormDialog
				key="project-create"
				open={createOpen}
				onOpenChange={setCreateOpen}
				title="Create New Project"
				submitLabel="Create Project"
				submitLoadingLabel="Creating..."
				onSubmit={handleCreateProject}
				isPending={createPending}
			/>

			<ProjectFormDialog
				key={editTarget?.id ?? "project-edit"}
				open={Boolean(editTarget)}
				onOpenChange={(open) => {
					if (!open) setEditTarget(null);
				}}
				title="Edit Project"
				submitLabel="Update Project"
				submitLoadingLabel="Updating..."
				defaultValues={
					editTarget
						? {
								name: editTarget.name,
								description: editTarget.description,
								status: editTarget.status,
							}
						: undefined
				}
				onSubmit={handleUpdateProject}
				isPending={updatePending}
			/>

			<ProjectDeleteDialog
				project={projectToDelete}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				onConfirm={handleConfirmDelete}
				isPending={deletePending}
			/>
		</>
	);
}
