"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Progress } from "@repo/ui/components/progress";
import { cn } from "@repo/ui/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import {
	AlertTriangle,
	CheckCircle2,
	ChevronRight,
	CircleX,
	Clock3,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
	DOCUMENT_WALLET_STATUS,
	getDocumentWalletProgressBarClass,
} from "@/constants/document-wallets";
import type { DocumentWalletListRow } from "@/types/document-wallets";

const COL = "max-w-[260px] min-w-0 px-2";

function statusBadgeVariant(
	status: DocumentWalletListRow["status"],
): "success" | "warning" | "error" {
	if (status === DOCUMENT_WALLET_STATUS.COMPLETE) return "success";
	if (status === DOCUMENT_WALLET_STATUS.IN_PROGRESS) return "warning";
	return "error";
}

function statusLabel(status: DocumentWalletListRow["status"]): string {
	if (status === DOCUMENT_WALLET_STATUS.COMPLETE) return "Complete";
	if (status === DOCUMENT_WALLET_STATUS.IN_PROGRESS) return "In Progress";
	return "Critical";
}

function StatusIcon({
	status,
}: Readonly<{ status: DocumentWalletListRow["status"] }>) {
	if (status === DOCUMENT_WALLET_STATUS.COMPLETE) {
		return <CheckCircle2 className="size-3.5 shrink-0" />;
	}
	if (status === DOCUMENT_WALLET_STATUS.IN_PROGRESS) {
		return <Clock3 className="size-3.5 shrink-0" />;
	}
	return <AlertTriangle className="size-3.5 shrink-0" />;
}

export function useDocumentWalletListColumns() {
	return useMemo<ColumnDef<DocumentWalletListRow>[]>(
		() => [
			{
				id: "candidate",
				header: "Candidate",
				accessorFn: (r) => r.name,
				cell: ({ row }) => (
					<div className={COL}>
						<p className="truncate font-medium text-sm">{row.original.name}</p>
						<p className="text-muted-foreground truncate text-xs">
							{row.original.email}
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
				id: "completion",
				header: "Completion",
				accessorFn: (r) =>
					r.totalDocs > 0 ? r.completedDocs / r.totalDocs : 0,
				cell: ({ row }) => {
					const { completedDocs, totalDocs } = row.original;
					const percent =
						totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;
					return (
						<div className="min-w-36 space-y-1.5">
							<p className="text-sm tabular-nums">
								{percent}%{" "}
								<span className="text-muted-foreground">
									({completedDocs} of {totalDocs})
								</span>
							</p>
							<Progress
								value={percent}
								className={cn(
									"bg-muted h-2",
									getDocumentWalletProgressBarClass(percent),
								)}
							/>
						</div>
					);
				},
			},
			{
				id: "documentsStatus",
				header: "Documents Status",
				enableSorting: false,
				cell: ({ row }) => {
					const { ok, pending, missing, warning } = row.original.docCounts;
					return (
						<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs min-w-36">
							<span className="text-muted-foreground flex items-center gap-1">
								<CheckCircle2 className="size-3.5 shrink-0 text-green-600" />
								{ok}
							</span>
							<span className="text-muted-foreground flex items-center gap-1">
								<Clock3 className="size-3.5 shrink-0 text-amber-500" />
								{pending}
							</span>
							<span className="text-muted-foreground flex items-center gap-1">
								<CircleX className="size-3.5 shrink-0 text-red-600" />
								{missing}
							</span>
							<span className="text-muted-foreground flex items-center gap-1">
								<AlertTriangle className="size-3.5 shrink-0 text-gray-500" />
								{warning}
							</span>
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
						<Badge
							variant={statusBadgeVariant(row.original.status)}
							className="gap-1"
						>
							<StatusIcon status={row.original.status} />
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
							variant="outline"
							size="sm"
							className="gap-1"
							asChild
						>
							<Link href={`/vendor/document-wallets/${row.original.id}`}>
								View Wallet
								<ChevronRight className="size-4 shrink-0" />
							</Link>
						</Button>
					</div>
				),
			},
		],
		[],
	);
}
