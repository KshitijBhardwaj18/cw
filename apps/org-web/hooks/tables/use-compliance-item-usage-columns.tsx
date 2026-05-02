"use client";

import { Badge } from "@repo/ui/components/badge";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useMemo } from "react";
import {
	COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS,
	COMPLIANCE_ITEM_USAGE_COLUMN_KEYS,
} from "@/constants/tables/compliance-item-usage";
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
						{row.original.category}
					</Badge>
				),
			},
			{
				id: COMPLIANCE_ITEM_USAGE_COLUMN_KEYS.usageType,
				header: () => (
					<div className="grid grid-cols-2 gap-4 text-center text-xs font-medium">
						<div>{COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.forSubmission}</div>
						<div>{COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.forPlacement}</div>
					</div>
				),
				cell: ({ row }) => {
					const value =
						itemUsages[row.original.id] ??
						("SUBMISSION" as ComplianceItemUsageType);
					return (
						<RadioGroup
							value={value}
							onValueChange={(v) =>
								onUsageChange(row.original.id, v as ComplianceItemUsageType)
							}
							className="grid grid-cols-2 place-items-center gap-4"
						>
							<RadioGroupItem value="SUBMISSION" />
							<RadioGroupItem value="PLACEMENT" />
						</RadioGroup>
					);
				},
			},
			{
				accessorKey: "expirationRequired",
				id: COMPLIANCE_ITEM_USAGE_COLUMN_KEYS.expirationRequired,
				header: () => (
					<div className="text-center">
						{COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.expirationRequired}
					</div>
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
					<div className="text-center">
						{COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.displayToCandidate}
					</div>
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
