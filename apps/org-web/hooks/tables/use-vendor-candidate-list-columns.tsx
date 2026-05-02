"use client";

import { getInitials } from "@repo/shared";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, CircleX, FileText } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { VENDOR_CANDIDATE_STATUS } from "@/constants/vendor-candidates";
import type {
	VendorCandidateListRow,
	VendorCandidateSource,
} from "@/types/vendor-candidates";

const COL = "max-w-[260px] min-w-0 px-2";

function statusBadgeVariant(
	status: VendorCandidateListRow["status"],
): "success" | "warning" | "inactive" {
	if (status === VENDOR_CANDIDATE_STATUS.ACTIVE) return "success";
	if (status === VENDOR_CANDIDATE_STATUS.ONBOARDING) return "warning";
	return "inactive";
}

function statusLabel(status: VendorCandidateListRow["status"]): string {
	if (status === VENDOR_CANDIDATE_STATUS.ACTIVE) return "Active";
	if (status === VENDOR_CANDIDATE_STATUS.ONBOARDING) return "Onboarding";
	return "Inactive";
}

function sourceLabel(source: VendorCandidateSource): string {
	switch (source) {
		case "DIRECT":
			return "Direct";
		case "PREVIOUS_WORKER":
			return "Prev. worker";
		default:
			return "Vendor";
	}
}

function sourceBadgeVariant(
	source: VendorCandidateSource,
): "info" | "secondary" | "outline" {
	switch (source) {
		case "DIRECT":
			return "secondary";
		case "PREVIOUS_WORKER":
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
				accessorFn: (r) => (r.documentsComplete ? 1 : 0),
				cell: ({ row }) => {
					const complete = row.original.documentsComplete;
					return (
						<div
							className={cn(
								"flex min-w-36 items-center gap-1.5 text-sm",
								complete
									? "text-green-700 dark:text-green-400"
									: "text-red-700 dark:text-red-400",
							)}
						>
							{complete ? (
								<>
									<CheckCircle2 className="size-4 shrink-0" />
									<span>Complete</span>
								</>
							) : (
								<>
									<CircleX className="size-4 shrink-0" />
									<span>Incomplete</span>
								</>
							)}
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
