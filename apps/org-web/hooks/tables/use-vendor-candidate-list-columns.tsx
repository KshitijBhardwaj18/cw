"use client";

import {
	CANDIDATE_SOURCE_OPTIONS,
	CandidateSource,
	getInitials,
	getLabel,
	VENDOR_CANDIDATE_PORTAL_STATUS_OPTIONS,
} from "@repo/shared";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, CircleX, FileText, MinusCircle } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import type { VendorCandidateListRow } from "@/types/vendor-candidates";

const COL = "max-w-[260px] min-w-0 px-2";

function statusBadgeVariant(
	status: VendorCandidateListRow["status"],
): "success" | "warning" | "inactive" {
	switch (status) {
		case "ACTIVE":
			return "success";
		case "ONBOARDING":
			return "warning";
		default:
			return "inactive";
	}
}

function statusLabel(status: VendorCandidateListRow["status"]): string {
	return getLabel(VENDOR_CANDIDATE_PORTAL_STATUS_OPTIONS, status);
}

function sourceLabel(source: VendorCandidateListRow["source"]): string {
	return getLabel(CANDIDATE_SOURCE_OPTIONS, source);
}

function sourceBadgeVariant(
	source: VendorCandidateListRow["source"],
): "info" | "secondary" | "outline" {
	switch (source) {
		case CandidateSource.DIRECT:
			return "secondary";
		case CandidateSource.PREVIOUS_WORKER:
			return "outline";
		default:
			return "info";
	}
}

export function useVendorCandidateListColumns() {
	return useMemo<ColumnDef<VendorCandidateListRow>[]>(
		() => [
			{
				id: "candidate",
				header: "Candidate",
				accessorFn: (r) => r.name,
				cell: ({ row }) => (
					<div className="flex min-w-0 items-center gap-3">
						<Avatar className="size-9 shrink-0">
							<AvatarFallback className="text-xs">
								{getInitials(row.original.name)}
							</AvatarFallback>
						</Avatar>
						<div className={cn(COL, "min-w-0 p-0")}>
							<p className="truncate font-medium text-sm">
								{row.original.name}
							</p>
							<p className="text-muted-foreground truncate text-xs">
								ID: {row.original.displayId}
							</p>
						</div>
					</div>
				),
			},
			{
				id: "contact",
				header: "Contact",
				accessorFn: (r) => r.email,
				cell: ({ row }) => (
					<div className={COL}>
						<p className="truncate text-sm">{row.original.email}</p>
						<p className="text-muted-foreground truncate text-xs">
							{row.original.phone}
						</p>
					</div>
				),
			},
			{
				id: "specialty",
				header: "Specialty",
				accessorFn: (r) => r.specialty,
				cell: ({ row }) => (
					<div className={COL}>
						<p className="truncate text-sm">{row.original.specialty}</p>
					</div>
				),
			},
			{
				id: "source",
				header: "Source",
				enableSorting: false,
				cell: ({ row }) => (
					<div className={COL}>
						<Badge variant={sourceBadgeVariant(row.original.source)}>
							{sourceLabel(row.original.source)}
						</Badge>
					</div>
				),
			},
			{
				id: "documents",
				header: "Documents",
				accessorFn: (r) =>
					r.documentsRequired && !r.documentsComplete ? 0 : 1,
				cell: ({ row }) => {
					const { documentsRequired, documentsComplete } = row.original;
					if (!documentsRequired) {
						return (
							<div className="text-muted-foreground flex min-w-36 items-center gap-1.5 text-sm">
								<MinusCircle className="size-4 shrink-0" />
								<span>Not required</span>
							</div>
						);
					}
					if (documentsComplete) {
						return (
							<div className="flex min-w-36 items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
								<CheckCircle2 className="size-4 shrink-0" />
								<span>Complete</span>
							</div>
						);
					}
					return (
						<div className="flex min-w-36 items-center gap-1.5 text-sm text-red-700 dark:text-red-400">
							<CircleX className="size-4 shrink-0" />
							<span>Incomplete</span>
						</div>
					);
				},
			},
			{
				id: "status",
				header: "Status",
				accessorFn: (r) => r.status,
				cell: ({ row }) => (
					<div className={COL}>
						<Badge variant={statusBadgeVariant(row.original.status)}>
							{statusLabel(row.original.status)}
						</Badge>
					</div>
				),
			},
			{
				id: "actions",
				header: () => (
					<span className="flex w-full justify-end pr-2">Actions</span>
				),
				enableSorting: false,
				cell: ({ row }) => (
					<div className="flex justify-end pr-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="gap-1.5 text-primary"
							asChild
						>
							<Link href={`/vendor/document-wallets/${row.original.id}`}>
								<FileText className="size-4 shrink-0" />
								Documents
							</Link>
						</Button>
					</div>
				),
			},
		],
		[],
	);
}
