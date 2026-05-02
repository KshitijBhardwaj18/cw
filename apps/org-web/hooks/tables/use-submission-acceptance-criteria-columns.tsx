"use client";

import { Badge } from "@repo/ui/components/badge";
import { Checkbox } from "@repo/ui/components/checkbox";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { cn } from "@repo/ui/lib/utils";
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

const INCLUDE_COLUMN_ID = "include";

const headerText =
	"text-xs font-medium uppercase leading-snug tracking-wide text-muted-foreground";

function HeaderWords({
	text,
	className,
}: {
	text: string;
	className?: string;
}) {
	const parts = text.trim().split(/\s+/);
	return (
		<div
			className={cn(
				"flex flex-wrap justify-center gap-x-1 gap-y-0.5 text-center whitespace-normal",
				headerText,
				className,
			)}
		>
			{parts.map((word, i) => (
				<span key={`${i}-${word}`}>{word}</span>
			))}
		</div>
	);
}

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
						className={`whitespace-normal text-center ${headerText} max-w-18`}
					>
						INCLUDE
					</div>
				),
				cell: ({ row }) => {
					const fixed = row.original.checklistPhase;
					const isPlacement = fixed === "PLACEMENT";
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
					<div className={`whitespace-normal text-left ${headerText} min-w-20`}>
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
					<div className={`whitespace-normal text-left ${headerText} min-w-16`}>
						{COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.category}
					</div>
				),
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
					<div className="grid min-w-42 grid-cols-2 gap-4 px-0.5">
						<HeaderWords
							text={COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.forSubmission}
						/>
						<HeaderWords
							text={COMPLIANCE_ITEM_USAGE_COLUMN_HEADERS.forPlacement}
						/>
					</div>
				),
				cell: ({ row }) => {
					const fixed = row.original.checklistPhase;
					const isPlacement = fixed === "PLACEMENT";
					const included = isPlacement || selectedSet.has(row.original.id);
					const value = (fixed ??
						itemUsages[row.original.id] ??
						("SUBMISSION" as ComplianceItemUsageType)) as ComplianceItemUsageType;
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
					<HeaderWords
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
					<HeaderWords
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
