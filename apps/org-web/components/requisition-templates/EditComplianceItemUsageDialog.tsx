"use client";

import { ComplianceChecklistItemPhase } from "@repo/shared";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { FormDialogFooter } from "@repo/ui/general/FormDialogFooter";
import { useForm, useStore } from "@tanstack/react-form";
import { useCallback, useEffect, useMemo } from "react";
import { useComplianceItemUsageColumns } from "@/hooks/tables/use-compliance-item-usage-columns";
import type {
	ComplianceItemUsageRow,
	ComplianceItemUsageType,
} from "@/types/requisition-compliance-checklist";

export type { ComplianceItemUsageRow, ComplianceItemUsageType };

type DialogFormValues = {
	itemUsages: Record<string, ComplianceItemUsageType>;
};

export interface EditComplianceItemUsageDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	templateName: string;
	items: ComplianceItemUsageRow[];
	initialUsages?: Record<string, ComplianceItemUsageType>;
	onSave?: (
		usages: Record<string, ComplianceItemUsageType>,
	) => void | Promise<void>;
}

function buildDefaultUsages(
	items: ComplianceItemUsageRow[],
	initialUsages?: Record<string, ComplianceItemUsageType>,
): Record<string, ComplianceItemUsageType> {
	return (
		initialUsages ??
		Object.fromEntries(
			items.map((item) => [
				item.id,
				ComplianceChecklistItemPhase.SUBMISSION as ComplianceItemUsageType,
			]),
		)
	);
}

export function EditComplianceItemUsageDialog({
	open,
	onOpenChange,
	templateName,
	items,
	initialUsages,
	onSave,
}: Readonly<EditComplianceItemUsageDialogProps>) {
	const defaultItemUsages = useMemo(
		() => buildDefaultUsages(items, initialUsages),
		[items, initialUsages],
	);

	const form = useForm({
		defaultValues: {
			itemUsages: defaultItemUsages,
		} satisfies DialogFormValues,
		onSubmit: async ({ value }) => {
			await onSave?.(value.itemUsages);
			onOpenChange(false);
		},
	});

	const itemUsages = useStore(form.store, (s) => s.values.itemUsages);

	useEffect(() => {
		if (!open || items.length === 0) return;
		form.reset({
			itemUsages: buildDefaultUsages(items, initialUsages),
		});
	}, [open, items, initialUsages, form]);

	const onUsageChange = useCallback(
		(itemId: string, usage: ComplianceItemUsageType) => {
			form.setFieldValue("itemUsages", (prev) => ({
				...(prev ?? {}),
				[itemId]: usage,
			}));
		},
		[form],
	);

	const { columns } = useComplianceItemUsageColumns({
		itemUsages,
		onUsageChange,
	});

	const summary = useMemo(() => {
		const usages = itemUsages;
		let forSubmission = 0;
		let forPlacement = 0;
		for (const item of items) {
			const u = usages[item.id] ?? ComplianceChecklistItemPhase.SUBMISSION;
			if (u === ComplianceChecklistItemPhase.SUBMISSION) forSubmission++;
			else forPlacement++;
		}
		return {
			total: items.length,
			forSubmission,
			forPlacement,
		};
	}, [items, itemUsages]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90dvh] min-w-0 w-full max-w-[min(100vw-2rem,80rem)] flex-col p-0 sm:min-w-[70vw]">
				<DialogHeader className="shrink-0 px-6 pt-6">
					<DialogTitle>Edit Compliance Item Usage</DialogTitle>
					<p className="text-muted-foreground text-sm">
						Configure when each compliance item is required for {templateName}
					</p>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
					className="flex min-h-0 flex-1 flex-col overflow-hidden"
				>
					<div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6">
						<div className="min-h-0 flex-1 overflow-auto">
							<CustomTable
								columns={columns}
								data={items}
								enableSorting={false}
								emptyState={
									<p className="text-muted-foreground py-8 text-center text-sm">
										No compliance items.
									</p>
								}
							/>
						</div>

						{/* Summary cards */}
						<div className="flex shrink-0 gap-4 pb-4 pt-4">
							<div className="w-full rounded-lg border px-4 py-3">
								<p className="text-muted-foreground text-xs">Total Items</p>
								<p className="text-lg font-semibold">{summary.total}</p>
							</div>
							<div className="w-full rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
								<p className="text-primary text-xs">For Submission</p>
								<p className="text-primary text-lg font-semibold">
									{summary.forSubmission}
								</p>
							</div>
							<div className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
								<p className="text-emerald-600 text-xs dark:text-emerald-400">
									For Placement
								</p>
								<p className="text-emerald-600 text-lg font-semibold dark:text-emerald-400">
									{summary.forPlacement}
								</p>
							</div>
						</div>
					</div>

					<div className="shrink-0 border-t px-6 pb-6 pt-4">
						<FormDialogFooter
							form={form}
							submitLabel="Save Changes"
							submitLoadingLabel="Saving..."
							onCancel={() => onOpenChange(false)}
							cancelLabel="Cancel"
						/>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
