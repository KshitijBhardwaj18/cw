"use client";

import { Action, useAbility } from "@repo/casl";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
	ConfigPageEmptyState,
	ConfigPageErrorState,
} from "@repo/ui/general/ConfigPageEmptyState";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { AlertCircle, LayoutTemplate, Plus, RefreshCcw } from "lucide-react";
import { useShiftTemplatesPage } from "@/hooks/use-shift-templates-page";
import type { ShiftTemplateFormValues } from "@/schemas/shift-template.schema";
import { ShiftBillingConfigurationDialog } from "./ShiftBillingConfigurationDialog";
import { ShiftTemplateCard } from "./ShiftTemplateCard";
import { ShiftTemplateDeleteDialog } from "./ShiftTemplateDeleteDialog";
import { ShiftTemplateFormDialog } from "./ShiftTemplateFormDialog";

export function ShiftTemplatesPageContent() {
	const ability = useAbility();
	const canCreateTemplate = ability.can(Action.Create, "ShiftTemplate");
	const canUpdateTemplate = ability.can(Action.Update, "ShiftTemplate");
	const canDeleteTemplate = ability.can(Action.Delete, "ShiftTemplate");

	const {
		search,
		setSearch,
		hasSearch,
		templates,
		total,
		createOpen,
		setCreateOpen,
		editTemplate,
		setEditTemplate,
		billingTemplate,
		setBillingTemplate,
		deleteTemplate,
		setDeleteTemplate,
		handleCreate,
		handleUpdate,
		handleBillingSave,
		handleDeleteConfirm,
		isCreating,
		isUpdating,
		isBillingPending,
		isDeleting,
		isLoading,
		isError,
		refetch,
	} = useShiftTemplatesPage();

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Shift Templates"
				total={total}
				itemLabel="template"
				itemLabelPlural="templates"
				description={
					hasSearch
						? undefined
						: "Create reusable shift templates for quick shift creation"
				}
				countText={
					hasSearch
						? `${total} template${total !== 1 ? "s" : ""} match${total === 1 ? "es" : ""}`
						: undefined
				}
				actions={
					canCreateTemplate
						? [
								{
									key: "create-template",
									icon: <Plus className="size-4" data-icon="inline-start" />,
									label: "Create Template",
									className: "font-semibold",
									onClick: () => setCreateOpen(true),
								},
							]
						: []
				}
				search={{
					value: search,
					onChange: setSearch,
					placeholder: "Search templates...",
				}}
			/>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-48" />
					))}
				</div>
			) : isError ? (
				<ConfigPageErrorState
					className="min-h-[400px] border-none"
					title="Failed to load templates"
					description="There was an error fetching your shift templates. Please try again or contact support if the problem persists."
					icon={AlertCircle}
					action={
						<Button variant="outline" size="sm" onClick={() => void refetch()}>
							<RefreshCcw className="mr-2 size-4" />
							Retry
						</Button>
					}
				/>
			) : templates.length === 0 ? (
				<ConfigPageEmptyState
					hasSearch={hasSearch}
					searchEmptyTitle="No templates match your search"
					emptyTitle="No shift templates yet"
					searchEmptyMessage="Try a different search term."
					emptyMessage={
						canCreateTemplate
							? "Create your first template to speed up shift creation."
							: "No shift templates have been created yet."
					}
					icon={LayoutTemplate}
					action={
						!hasSearch && canCreateTemplate ? (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCreateOpen(true)}
							>
								<Plus className="size-4" data-icon="inline-start" />
								Create Template
							</Button>
						) : null
					}
				/>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{templates.map((template) => (
						<ShiftTemplateCard
							key={template.id}
							template={template}
							onEdit={canUpdateTemplate ? (t) => setEditTemplate(t) : undefined}
							onDelete={
								canDeleteTemplate ? (t) => setDeleteTemplate(t) : undefined
							}
							onOpenBilling={
								canUpdateTemplate ? (t) => setBillingTemplate(t) : undefined
							}
						/>
					))}
				</div>
			)}

			<ShiftTemplateFormDialog
				key={editTemplate?.id ?? "create"}
				open={createOpen || Boolean(editTemplate)}
				onOpenChange={(open) => {
					if (!open) {
						setCreateOpen(false);
						setEditTemplate(null);
					}
				}}
				initialValues={
					editTemplate
						? {
								templateName: editTemplate.templateName,
								occupationId: editTemplate.occupationId,
								departmentId: editTemplate.departmentId,
								locationId: editTemplate.locationId,
								shiftType:
									editTemplate.shiftType as ShiftTemplateFormValues["shiftType"],
								durationHours: editTemplate.durationHours,
								baseRate: editTemplate.baseRate,
								limitShiftVisibility: editTemplate.limitShiftVisibility,
								visibilityUnlockDuration:
									editTemplate.visibilityUnlockDuration ?? undefined,
								visibilityUnlockUnit:
									(editTemplate.visibilityUnlockUnit as ShiftTemplateFormValues["visibilityUnlockUnit"]) ??
									undefined,
								baseBillRate: editTemplate.baseBillRate ?? undefined,
								vendorRateMarkupPercent:
									editTemplate.vendorRateMarkupPercent ?? undefined,
								offerIncentive: editTemplate.offerIncentive,
								incentiveByHour: editTemplate.incentiveByHour ?? undefined,
								incentiveByShift: editTemplate.incentiveByShift ?? undefined,
							}
						: undefined
				}
				onSubmit={editTemplate ? handleUpdate : handleCreate}
				isSubmitting={isCreating || isUpdating}
			/>

			{billingTemplate && (
				<ShiftBillingConfigurationDialog
					open={Boolean(billingTemplate)}
					onOpenChange={(open) => {
						if (!open) setBillingTemplate(null);
					}}
					templateName={billingTemplate.templateName}
					initialValues={{
						baseBillRate: billingTemplate.baseBillRate ?? 0,
						vendorRateMarkupPercent:
							billingTemplate.vendorRateMarkupPercent ?? 0,
						offerIncentive: billingTemplate.offerIncentive,
						incentiveByHour: billingTemplate.incentiveByHour ?? 0,
						incentiveByShift: billingTemplate.incentiveByShift ?? 0,
					}}
					onSubmit={handleBillingSave}
					isSubmitting={isBillingPending}
				/>
			)}

			<ShiftTemplateDeleteDialog
				template={deleteTemplate}
				open={Boolean(deleteTemplate)}
				onOpenChange={(open) => {
					if (!open) setDeleteTemplate(null);
				}}
				onConfirm={handleDeleteConfirm}
				isDeleting={isDeleting}
			/>
		</div>
	);
}
