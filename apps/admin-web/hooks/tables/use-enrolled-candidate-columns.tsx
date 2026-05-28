"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Power, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type { EnrolledCandidateRow } from "@/types/users";

type Options = {
	onToggleActive?: (row: EnrolledCandidateRow) => void;
	onDelete?: (row: EnrolledCandidateRow) => void;
};

export function useEnrolledCandidateColumns(options: Options = {}) {
	const { onToggleActive, onDelete } = options;
	const columns = useMemo<ColumnDef<EnrolledCandidateRow>[]>(
		() => [
			{
				accessorKey: "name",
				header: "NAME",
				cell: ({ row }) => (
					<div className="text-sm font-medium">{row.original.name}</div>
				),
			},
			{
				accessorKey: "email",
				header: "EMAIL",
				cell: ({ row }) => <div className="text-sm">{row.original.email}</div>,
			},
			{
				accessorKey: "occupation",
				header: "OCCUPATION",
				cell: ({ row }) => (
					<div className="text-sm">{row.original.occupation}</div>
				),
			},
			{
				accessorKey: "workforceType",
				header: "WORKFORCE TYPE",
				cell: ({ row }) => (
					<div className="text-sm">{row.original.workforceType ?? "—"}</div>
				),
			},
			{
				accessorKey: "vendorName",
				header: "VENDOR",
				cell: ({ row }) => (
					<div className="text-sm">{row.original.vendorName ?? "—"}</div>
				),
			},
			{
				accessorKey: "isActive",
				header: "STATUS",
				cell: ({ row }) => (
					<Badge variant={row.original.isActive ? "success" : "secondary"}>
						{row.original.isActive ? "Active" : "Inactive"}
					</Badge>
				),
			},
			{
				id: "actions",
				header: "ACTIONS",
				cell: ({ row }) => {
					const isActive = row.original.isActive;
					return (
						<div className="flex items-center gap-1">
							{onToggleActive && (
								<Button
									variant="ghost"
									size="icon"
									className="size-8"
									onClick={() => onToggleActive(row.original)}
									title={isActive ? "Deactivate" : "Activate"}
									aria-label={isActive ? "Deactivate" : "Activate"}
								>
									{isActive ? (
										<Ban className="size-4" />
									) : (
										<Power className="size-4" />
									)}
								</Button>
							)}
							{onDelete && (
								<Button
									variant="ghost"
									size="icon"
									className="text-destructive hover:text-destructive size-8"
									onClick={() => onDelete(row.original)}
									title="Close account"
									aria-label="Close account"
								>
									<Trash2 className="size-4" />
								</Button>
							)}
						</div>
					);
				},
			},
		],
		[onToggleActive, onDelete],
	);
	return { columns };
}
