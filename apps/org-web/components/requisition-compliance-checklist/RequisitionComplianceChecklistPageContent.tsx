"use client";

import { Action, useAbility } from "@repo/casl";
import { Button } from "@repo/ui/components/button";
import { ConfigPageEmptyState } from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { ClipboardList, Plus } from "lucide-react";
import { useRequisitionComplianceChecklistPage } from "@/hooks/use-requisition-compliance-checklist-page";
import type { ChecklistItemPhase } from "@/types/requisition-compliance-checklist";
import { ChecklistTemplateDeleteDialog } from "./ChecklistTemplateDeleteDialog";
import { CreateChecklistTemplateDialog } from "./CreateChecklistTemplateDialog";
import { RequisitionComplianceChecklistCard } from "./RequisitionComplianceChecklistCard";

export function RequisitionComplianceChecklistPageContent() {
	const ability = useAbility();
	const canCreateChecklist = ability.can(Action.Create, "ComplianceChecklist");
	const canUpdateChecklist = ability.can(Action.Update, "ComplianceChecklist");
	const canDeleteChecklist = ability.can(Action.Delete, "ComplianceChecklist");

	const {
		checklists,
		hasSearch,
		createOpen,
		editId,
		viewId,
		deleteId,
		search,
		setSearch,
		page,
		goToPage,
		limit,
		setLimit,
		checklistToDelete,
		totalCount,
		pageCount,
		handleCreateSubmit,
		handleDeleteConfirm,
		handleDuplicate,
		setCreateOpen,
		setEditId,
		setViewId,
		setDeleteId,
		handleCreateDialogOpenChange,
		handleDeleteDialogOpenChange,
		editChecklist,
		viewChecklist,
		PAGE_SIZE_OPTIONS,
		isSubmitting,
	} = useRequisitionComplianceChecklistPage();

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Requisition Compliance Checklists"
				total={totalCount}
				itemLabel="checklist template"
				itemLabelPlural="checklist templates"
				description={
					hasSearch
						? undefined
						: "Build compliance checklist templates to define job-specific requirements. These templates are linked to requisition templates and determine which documents and credentials are required for each role."
				}
				countText={
					hasSearch
						? `${totalCount} checklist template${totalCount !== 1 ? "s" : ""} match${totalCount === 1 ? "es" : ""}`
						: undefined
				}
				actions={
					canCreateChecklist
						? [
								{
									key: "create",
									icon: <Plus className="size-4" />,
									label: "Create Checklist Template",
									onClick: () => setCreateOpen(true),
								},
							]
						: []
				}
				search={{
					value: search,
					onChange: setSearch,
					placeholder: "Search checklist templates...",
				}}
			/>

			<div className="space-y-4">
				<div className="flex flex-col gap-4">
					{checklists.length === 0 ? (
						<ConfigPageEmptyState
							hasSearch={hasSearch}
							searchEmptyTitle="No checklist templates match your search"
							emptyTitle="No checklist templates yet"
							searchEmptyMessage="Try a different search term."
							emptyMessage={
								canCreateChecklist
									? "Create your first checklist template to define job-specific compliance requirements."
									: "No checklist templates have been created yet."
							}
							icon={ClipboardList}
							action={
								!hasSearch && canCreateChecklist ? (
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCreateOpen(true)}
									>
										<Plus className="size-4" data-icon="inline-start" />
										Create Checklist Template
									</Button>
								) : null
							}
						/>
					) : (
						checklists.map((checklist) => (
							<RequisitionComplianceChecklistCard
								key={checklist.id}
								checklist={{
									id: checklist.id,
									name: checklist.name,
									description: checklist.description ?? undefined,
									checklistItemCount: checklist.items.length,
									linkedRequisitionCount: 0,
									lastModified: new Date(
										checklist.updatedAt,
									).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									}),
									complianceItemIds: checklist.items.map(
										(i) => i.complianceListItemId,
									),
									checklistItems: checklist.items.map((i) => ({
										complianceListItemId: i.complianceListItemId,
										phase: i.phase as ChecklistItemPhase,
									})),
								}}
								onView={(id) => setViewId(id)}
								onEdit={canUpdateChecklist ? (id) => setEditId(id) : undefined}
								onDuplicate={canCreateChecklist ? handleDuplicate : undefined}
								onDelete={
									canDeleteChecklist ? (id) => setDeleteId(id) : undefined
								}
							/>
						))
					)}
				</div>

				{totalCount > 0 && (
					<PaginationControls
						currentPage={page}
						pageCount={pageCount}
						goToPage={goToPage}
						limit={limit}
						setLimit={setLimit}
						pageSizeOptions={PAGE_SIZE_OPTIONS}
					/>
				)}
			</div>

			<CreateChecklistTemplateDialog
				open={createOpen || Boolean(editId) || Boolean(viewId)}
				onOpenChange={handleCreateDialogOpenChange}
				onSubmit={viewId ? undefined : handleCreateSubmit}
				viewMode={Boolean(viewId)}
				isSubmitting={isSubmitting}
				initialValues={
					editChecklist
						? {
								templateName: editChecklist.name,
								description: editChecklist.description ?? undefined,
								complianceItemIds: editChecklist.items.map(
									(i) => i.complianceListItemId,
								),
							}
						: viewChecklist
							? {
									templateName: viewChecklist.name,
									description: viewChecklist.description ?? undefined,
									complianceItemIds: viewChecklist.items.map(
										(i) => i.complianceListItemId,
									),
								}
							: undefined
				}
			/>

			<ChecklistTemplateDeleteDialog
				checklistName={checklistToDelete?.name ?? null}
				open={Boolean(deleteId)}
				onOpenChange={handleDeleteDialogOpenChange}
				onConfirm={handleDeleteConfirm}
			/>
		</div>
	);
}
