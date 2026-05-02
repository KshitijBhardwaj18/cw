"use client";

import { Action, useAbility } from "@repo/casl";
import { formatCurrency } from "@repo/shared";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { CustomTable } from "@repo/ui/general/CustomTable";
import { useMemo, useState } from "react";
import type { SpendBreakdownRow } from "@/constants/spend-analytics";
import { useSpendBreakdownColumns } from "@/hooks/tables/use-spend-breakdown-columns";
import { CancelRequisitionDialog } from "./CancelRequisitionDialog";

export type SpendBreakdownTableSectionProps = {
	orgId: string;
	data?: SpendBreakdownRow[];
	isLoading?: boolean;
};

export function SpendBreakdownTableSection({
	orgId,
	data,
	isLoading = false,
}: SpendBreakdownTableSectionProps) {
	const ability = useAbility();
	const canCancel = ability.can(Action.Update, "SpendAnalytics");
	const [cancelRow, setCancelRow] = useState<SpendBreakdownRow | null>(null);

	const rows = data ?? [];

	const columns = useSpendBreakdownColumns({
		onCancelRequest: (row) => setCancelRow(row),
		canCancel,
	});

	const totalOpenSpend = useMemo(
		() =>
			rows.reduce((sum, r) => sum + (r.openSpend != null ? r.openSpend : 0), 0),
		[rows],
	);

	const totalCommittedSpend = useMemo(
		() =>
			rows.reduce(
				(sum, r) => sum + (r.committedSpend != null ? r.committedSpend : 0),
				0,
			),
		[rows],
	);

	const effectiveOpenTotal = totalOpenSpend;
	const effectiveCommittedTotal = totalCommittedSpend;

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="font-semibold text-lg">
						Open vs Committed Spend Breakdown
					</CardTitle>
					<CardDescription>
						<span className="font-medium text-violet-700 dark:text-violet-300">
							Open Spend
						</span>
						: Requisitions with no accepted offer.{" "}
						<span className="font-medium text-amber-800 dark:text-amber-300">
							Committed Spend
						</span>
						: Offer accepted, worker not started.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					) : (
						<>
							<CustomTable
								data={rows}
								columns={columns}
								enableSorting
								enablePagination
								paginationMode="client"
								pageSize={10}
								className="rounded-none border-0 border-b-0"
								emptyState={
									<p className="text-muted-foreground py-8 text-center text-sm">
										No requisitions in this breakdown.
									</p>
								}
							/>
							<div className="bg-muted/30 flex flex-wrap items-center justify-end gap-6 border-t px-4 py-3 text-sm">
								<span className="text-muted-foreground font-medium">
									Totals:
								</span>
								<div className="flex flex-wrap items-center gap-6">
									<span className="text-muted-foreground">
										Open Spend:{" "}
										<span className="font-semibold text-violet-700 tabular-nums dark:text-violet-300">
											{formatCurrency(effectiveOpenTotal)}
										</span>
									</span>
									<span className="text-muted-foreground">
										Committed Spend:{" "}
										<span className="font-semibold text-amber-800 tabular-nums dark:text-amber-300">
											{formatCurrency(effectiveCommittedTotal)}
										</span>
									</span>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			<CancelRequisitionDialog
				orgId={orgId}
				row={cancelRow}
				onOpenChange={(open) => !open && setCancelRow(null)}
			/>
		</>
	);
}
