"use client";

import { Action, useAbility } from "@repo/casl";
import { Button } from "@repo/ui/components/button";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { ConfigPagePagination } from "@repo/ui/general/ConfigPagePagination";
import LoadingScreen from "@repo/ui/general/LoadingScreen";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { AlertCircle, FileText, Plus } from "lucide-react";
import { useRequisitionTemplatesPage } from "@/hooks/use-requisition-templates-page";
import { RequisitionTemplateCard } from "./RequisitionTemplateCard";
import { SelectRequisitionTypeDialog } from "./SelectRequisitionTypeDialog";

export function RequisitionTemplatesPageContent() {
	const ability = useAbility();
	const canCreateTemplate = ability.can(Action.Create, "RequisitionTemplate");
	const canUpdateTemplate = ability.can(Action.Update, "RequisitionTemplate");

	const page = useRequisitionTemplatesPage();

	const showFatalListError =
		page.isError && !page.isLoading && page.templates.length === 0;

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Requisition Templates"
				total={page.totalCount}
				itemLabel="template"
				itemLabelPlural="templates"
				countText={
					page.isLoading
						? "Loading templates…"
						: showFatalListError
							? "Could not load templates"
							: page.hasActiveFilters
								? `Showing ${page.templates.length} of ${page.totalCount} template${page.totalCount !== 1 ? "s" : ""}`
								: `${page.totalCount} template${page.totalCount !== 1 ? "s" : ""}`
				}
				actions={
					canCreateTemplate
						? [
								{
									key: "create",
									icon: <Plus className="size-4" />,
									label: "Create Requisition Template",
									onClick: () => page.setCreateDialogOpen(true),
								},
							]
						: []
				}
			/>

			<p className="text-muted-foreground -mt-2 text-sm">
				Manage job templates used to create new requisitions.
			</p>

			<SearchWithFilters
				searchPlaceholder="Search templates by name, occupation, specialty, or location..."
				searchValue={page.localSearch}
				onSearchChange={page.handleSearchChange}
				filtersExpanded={page.filtersExpanded}
				onFiltersExpandedChange={page.setFiltersExpanded}
				filterConfigs={page.filterConfigs}
			/>

			<div className="space-y-4">
				{showFatalListError ? (
					<ConfigPageErrorState
						title="Could not load templates"
						description={page.listErrorMessage}
						icon={AlertCircle}
						action={
							<Button
								type="button"
								size="sm"
								onClick={() => void page.refetchTemplates()}
							>
								Try again
							</Button>
						}
					/>
				) : page.isLoading ? (
					<div className="flex h-64 flex-col items-center justify-center gap-4">
						<LoadingScreen message="Loading templates…" />
					</div>
				) : page.templates.length === 0 ? (
					<ConfigPageEmptyState
						hasSearch={page.hasActiveFilters}
						searchEmptyTitle="No templates match your filters"
						emptyTitle="No templates found"
						searchEmptyMessage="Try adjusting search or filters, or create a new template."
						emptyMessage={
							canCreateTemplate
								? "Create your first requisition template to get started."
								: "No requisition templates have been created yet."
						}
						icon={FileText}
						action={
							!page.hasActiveFilters && canCreateTemplate ? (
								<Button
									variant="outline"
									size="sm"
									onClick={() => page.setCreateDialogOpen(true)}
								>
									<Plus className="size-4" data-icon="inline-start" />
									Create Requisition Template
								</Button>
							) : null
						}
					/>
				) : (
					<>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{page.templates.map((template) => (
								<RequisitionTemplateCard
									key={template.id}
									template={template}
									onEdit={canUpdateTemplate ? page.handleEdit : undefined}
									onUseTemplate={page.handleUseTemplate}
									onViewDetails={page.handleViewDetails}
								/>
							))}
						</div>
						<ConfigPagePagination
							page={page.page}
							totalPages={page.totalPages}
							onPageChange={page.setPage}
						/>
					</>
				)}
			</div>

			<SelectRequisitionTypeDialog
				open={page.createDialogOpen}
				onOpenChange={page.setCreateDialogOpen}
				onSelectType={page.handleCreateTypeSelect}
			/>
		</div>
	);
}
