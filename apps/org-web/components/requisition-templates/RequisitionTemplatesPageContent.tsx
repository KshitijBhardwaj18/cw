"use client";

import { Action, useAbility } from "@repo/casl";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { Plus } from "lucide-react";
import { useRequisitionTemplatesPage } from "@/hooks/use-requisition-templates-page";
import { RequisitionTemplateCard } from "./RequisitionTemplateCard";
import { SelectRequisitionTypeDialog } from "./SelectRequisitionTypeDialog";

export function RequisitionTemplatesPageContent() {
	const ability = useAbility();
	const canCreateTemplate = ability.can(Action.Create, "RequisitionTemplate");
	const canUpdateTemplate = ability.can(Action.Update, "RequisitionTemplate");

	const page = useRequisitionTemplatesPage();

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Requisition Templates"
				total={page.filteredTemplates.length}
				itemLabel="template"
				itemLabelPlural="templates"
				description="Manage job templates used to create new requisitions."
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

			<SearchWithFilters
				searchPlaceholder="Search templates..."
				searchValue={page.search}
				onSearchChange={page.setSearch}
				filtersExpanded={page.filtersExpanded}
				onFiltersExpandedChange={page.setFiltersExpanded}
				filterConfigs={page.filterConfigs}
			/>

			<div className="space-y-4">
				<p className="text-muted-foreground text-sm">
					Showing {page.filteredTemplates.length} of {page.templates.length}{" "}
					templates
				</p>

				{page.filteredTemplates.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
						<p className="font-medium text-sm">No templates found</p>
						<p className="text-muted-foreground mt-1 text-xs">
							{page.hasFilters
								? "Try adjusting your search or filters"
								: "Create your first requisition template to get started"}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{page.filteredTemplates.map((template) => (
							<RequisitionTemplateCard
								key={template.id}
								template={template}
								onEdit={canUpdateTemplate ? page.handleEdit : undefined}
								onUseTemplate={page.handleUseTemplate}
								onViewDetails={page.handleViewDetails}
							/>
						))}
					</div>
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
