"use client";

import {
	ComplianceChecklistItemPhase,
	getComplianceListItemCategoryLabel,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { Checkbox } from "@repo/ui/components/checkbox";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useMemo } from "react";
import {
	COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS,
	COMPLIANCE_ITEM_USAGE_COLUMN_KEYS,
} from "@/constants/tables/compliance-item-usage";
import {
	COMPLIANCE_CHECKLIST_TABLE_HEADER_CLASS,
	ComplianceChecklistTableHeaderWords,
	ComplianceChecklistUsageTypeColumnHeaders,
} from "@/hooks/tables/ComplianceChecklistTableHeaderWords";
import type {
	ComplianceItemUsageRow,
	ComplianceItemUsageType,
} from "@/types/requisition-compliance-checklist";

const INCLUDE_COLUMN_ID = "include";

export interface UseSubmissionAcceptanceCriteriaColumnsProps {
	itemUsages: Record<string, ComplianceItemUsageType>;
	selectedIds: string[];
	onToggleSelected: (itemId: string, checked: boolean) => void;
	onUsageChange: (itemId: string, usage: ComplianceItemUsageType) => void;
	disabled?: boolean;
}

export function useSubmissionAcceptanceCriteriaColumns({
	itemUsages,
	selectedIds,
	onToggleSelected,
	onUsageChange,
	disabled = false,
}: UseSubmissionAcceptanceCriteriaColumnsProps) {
	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
	const columns = useMemo<ColumnDef<ComplianceItemUsageRow>[]>(
		() => [
			{
				id: INCLUDE_COLUMN_ID,
				header: () => (
					<div
						className={`whitespace-normal text-center ${COMPLIANCE_CHECKLIST_TABLE_HEADER_CLASS} max-w-18`}
					>
						INCLUDE
					</div>
				),
				cell: ({ row }) => {
					const fixed = row.original.checklistPhase;
					const isPlacement = fixed === ComplianceChecklistItemPhase.PLACEMENT;
					const checked = isPlacement || selectedSet.has(row.original.id);
					return (
						<div className="flex justify-center">
							<Checkbox
								checked={checked}
								disabled={disabled || isPlacement}
								onCheckedChange={(value) => {
									if (isPlacement) return;
									onToggleSelected(row.original.id, Boolean(value));
								}}
								aria-label={`Include ${row.original.name}`}
							/>
						</div>
					);
				},
			},
			{
				accessorKey: "name",
				id: COMPLIANCE_ITEM_USAGE_COLUMN_KEYS.itemName,
				header: () => (
					<div
						className={`whitespace-normal text-left ${COMPLIANCE_CHECKLIST_TABLE_HEADER_CLASS} min-w-20`}
					>
						{COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.itemName}
					</div>
				),
				cell: ({ row }) => (
					<span className="font-medium">{row.original.name}</span>
				),
			},
			{
				accessorKey: COMPLIANCE_ITEM_USAGE_COLUMN_KEYS.category,
				header: () => (
					<div
						className={`whitespace-normal text-left ${COMPLIANCE_CHECKLIST_TABLE_HEADER_CLASS} min-w-16`}
					>
						{COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.category}
					</div>
				),
				cell: ({ row }) => (
					<Badge
						variant="secondary"
						className="text-muted-foreground font-normal"
					>
						{getComplianceListItemCategoryLabel(row.original.category)}
					</Badge>
				),
			},
			{
				id: COMPLIANCE_ITEM_USAGE_COLUMN_KEYS.usageType,
				header: () => <ComplianceChecklistUsageTypeColumnHeaders />,
				cell: ({ row }) => {
					const fixed = row.original.checklistPhase;
					const isPlacement = fixed === ComplianceChecklistItemPhase.PLACEMENT;
					const included = isPlacement || selectedSet.has(row.original.id);
					const value = (fixed ??
						itemUsages[row.original.id] ??
						ComplianceChecklistItemPhase.SUBMISSION) as ComplianceItemUsageType;
					const usageLocked = fixed !== undefined;
					return (
						<RadioGroup
							value={value}
							disabled={disabled || !included || usageLocked}
							onValueChange={(v) =>
								onUsageChange(row.original.id, v as ComplianceItemUsageType)
							}
							className="grid grid-cols-2 place-items-center gap-4"
						>
							<RadioGroupItem value={ComplianceChecklistItemPhase.SUBMISSION} />
							<RadioGroupItem value={ComplianceChecklistItemPhase.PLACEMENT} />
						</RadioGroup>
					);
				},
			},
			{
				accessorKey: "expirationRequired",
				id: COMPLIANCE_ITEM_USAGE_COLUMN_KEYS.expirationRequired,
				header: () => (
					<ComplianceChecklistTableHeaderWords
						text={COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.expirationRequired}
						className="min-w-22"
					/>
				),
				cell: ({ row }) => (
					<div className="flex justify-center">
						{row.original.expirationRequired ? (
							<span className="inline-flex size-6 items-center justify-center rounded-full bg-green-100 text-green-600">
								<Check className="size-4" />
							</span>
						) : (
							<span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
								<X className="size-4" />
							</span>
						)}
					</div>
				),
			},
			{
				accessorKey: "displayToCandidate",
				id: COMPLIANCE_ITEM_USAGE_COLUMN_KEYS.displayToCandidate,
				header: () => (
					<ComplianceChecklistTableHeaderWords
						text={COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.displayToCandidate}
						className="min-w-22"
					/>
				),
				cell: ({ row }) => (
					<div className="flex justify-center">
						{row.original.displayToCandidate ? (
							<span className="text-primary inline-flex items-center justify-center">
								<Eye className="size-5" />
							</span>
						) : (
							<span className="text-muted-foreground inline-flex items-center justify-center">
								<EyeOff className="size-5" />
							</span>
						)}
					</div>
				),
			},
		],
		[disabled, itemUsages, onToggleSelected, onUsageChange, selectedSet],
	);

	return { columns };
}
