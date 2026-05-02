"use client";

import {
	WORKFORCE_BILLING_FEE_TYPE_OPTIONS,
	type WorkforceBillingFeeType,
} from "@repo/shared";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@repo/ui/components/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { cn } from "@repo/ui/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { DollarSign } from "lucide-react";

export type WorkforceBillingRateRow = {
	id: string;
	workforceType: string;
	name: string;
	status: boolean;
	techFee: number;
	feeType: WorkforceBillingFeeType;
};

interface UseWorkforceBillingRateColumnsProps {
	onStatusChange?: (rateId: string, status: boolean) => void;
	onRateChange?: (rateId: string, techFee: number) => void;
	onFeeTypeChange?: (rateId: string, feeType: WorkforceBillingFeeType) => void;
	disabled?: boolean;
}

export function useWorkforceBillingRateColumns({
	onStatusChange,
	onRateChange,
	onFeeTypeChange,
	disabled = false,
}: UseWorkforceBillingRateColumnsProps = {}) {
	const columns: ColumnDef<WorkforceBillingRateRow>[] = [
		{
			accessorKey: "name",
			header: "WORKFORCE TYPE",
			cell: ({ row }) => (
				<span className="font-medium">{row.original.name}</span>
			),
		},
		{
			accessorKey: "status",
			header: "STATUS",
			cell: ({ row }) => {
				const active = row.original.status;
				return (
					<div className="flex items-center gap-2">
						<Switch
							checked={active}
							disabled={disabled}
							onCheckedChange={(v) =>
								onStatusChange?.(row.original.id, Boolean(v))
							}
						/>
						<span
							className={cn(
								"text-sm",
								active ? "text-emerald-600" : "text-muted-foreground",
							)}
						>
							{active ? "Enabled" : "Disabled"}
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "techFee",
			header: "TECH FEE",
			cell: ({ row }) => (
				<InputGroup className="max-w-[140px]">
					<InputGroupAddon>
						<DollarSign className="size-4" />
					</InputGroupAddon>
					<InputGroupInput
						type="number"
						step="0.01"
						min={0}
						disabled={disabled}
						defaultValue={row.original.techFee}
						key={`${row.original.id}-${row.original.techFee}`}
						onBlur={(e) =>
							onRateChange?.(row.original.id, Number(e.target.value))
						}
					/>
				</InputGroup>
			),
		},
		{
			accessorKey: "feeType",
			header: "FEE TYPE",
			cell: ({ row }) => (
				<Select
					value={row.original.feeType}
					disabled={disabled}
					onValueChange={(v) =>
						onFeeTypeChange?.(row.original.id, v as WorkforceBillingFeeType)
					}
				>
					<SelectTrigger className="w-[140px]">
						<SelectValue placeholder="Select" />
					</SelectTrigger>
					<SelectContent>
						{WORKFORCE_BILLING_FEE_TYPE_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			),
		},
	];

	return { columns };
}
