"use client";

import {
	ComplianceChecklistItemPhase,
	getComplianceListItemCategoryLabel,
} from "@repo/shared";
import { Badge } from "@repo/ui/components/badge";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useMemo } from "react";
import {
	COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS,
	COMPLIANCE_ITEM_USAGE_COLUMN_KEYS,
} from "@/constants/tables/compliance-item-usage";
import {
	ComplianceChecklistTableHeaderWords,
	ComplianceChecklistUsageTypeColumnHeaders,
} from "@/hooks/tables/ComplianceChecklistTableHeaderWords";
import type {
	ComplianceItemUsageRow,
	ComplianceItemUsageType,
} from "@/types/requisition-compliance-checklist";

export interface UseComplianceItemUsageColumnsProps {
	itemUsages: Record<string, ComplianceItemUsageType>;
	onUsageChange: (itemId: string, usage: ComplianceItemUsageType) => void;
}

export function useComplianceItemUsageColumns({
	itemUsages,
	onUsageChange,
}: UseComplianceItemUsageColumnsProps) {
	const columns = useMemo<ColumnDef<ComplianceItemUsageRow>[]>(
		() => [
			{
				accessorKey: "name",
				id: COMPLIANCE_ITEM_USAGE_COLUMN_KEYS.itemName,
				header: COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.itemName,
				cell: ({ row }) => (
					<span className="font-medium">{row.original.name}</span>
				),
			},
			{
				accessorKey: COMPLIANCE_ITEM_USAGE_COLUMN_KEYS.category,
				header: COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.category,
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
					const value =
						itemUsages[row.original.id] ??
						ComplianceChecklistItemPhase.SUBMISSION;
					return (
						<RadioGroup
							value={value}
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
		[itemUsages, onUsageChange],
	);

	return { columns };
}
