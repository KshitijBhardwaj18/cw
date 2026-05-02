"use client";

import { formatCurrency } from "@repo/shared";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { toast } from "sonner";
import type { SpendBreakdownRow } from "@/constants/spend-analytics";
import { useCancelRequisition } from "@/queries/requisitions.queries";

const SAVINGS_IMPACT_RATE = 0.08;

export type CancelRequisitionDialogProps = {
	orgId: string;
	row: SpendBreakdownRow | null;
	onOpenChange: (open: boolean) => void;
};

export function CancelRequisitionDialog({
	orgId,
	row,
	onOpenChange,
}: CancelRequisitionDialogProps) {
	const cancelMutation = useCancelRequisition(orgId);
	const openSpend = row?.openSpend ?? 0;
	const savingsImpact = Math.round(openSpend * SAVINGS_IMPACT_RATE);

	const handleConfirmCancel = async () => {
		if (!row) return;
		try {
			await cancelMutation.mutateAsync(row.requisitionUuid);
			toast.success(`Requisition ${row.requisitionId} cancelled.`);
			onOpenChange(false);
		} catch (e) {
			toast.error(
				e instanceof Error ? e.message : "Failed to cancel requisition",
			);
		}
	};

	return (
		<Dialog open={row != null} onOpenChange={onOpenChange}>
			<DialogContent className="gap-0 p-0 sm:max-w-lg">
				<DialogHeader className="border-border border-b px-6 py-4">
					<DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
						Cancel Requisition
					</DialogTitle>
				</DialogHeader>

				{row ? (
					<>
						<div className="space-y-4 px-6 py-4">
							<p className="text-foreground text-sm">
								Are you sure you want to cancel this requisition?
							</p>

							<div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4 text-sm">
								<div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
									<span className="text-muted-foreground shrink-0">
										Requisition ID:
									</span>
									<span className="font-medium text-[hsl(173_58%_38%)] dark:text-[hsl(173_50%_52%)]">
										{row.requisitionId}
									</span>
								</div>
								<div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
									<span className="text-muted-foreground shrink-0">Name:</span>
									<span className="font-semibold text-foreground">
										{row.requisitionName}
									</span>
								</div>
								<div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
									<span className="text-muted-foreground shrink-0">
										Department:
									</span>
									<span className="text-foreground">{row.department}</span>
								</div>
								<div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
									<span className="text-muted-foreground shrink-0">
										Open Spend:
									</span>
									<span className="font-semibold text-violet-700 tabular-nums dark:text-violet-300">
										{formatCurrency(openSpend)}
									</span>
								</div>
							</div>

							<p className="text-muted-foreground text-sm leading-relaxed">
								Canceling this requisition will remove it from the system and
								add approximately{" "}
								<span className="font-semibold text-emerald-600 dark:text-emerald-400">
									{formatCurrency(savingsImpact)}
								</span>{" "}
								to your savings metrics (8% of open spend).
							</p>
						</div>

						<DialogFooter className="border-border flex-row justify-end gap-2 border-t px-6 py-4 sm:gap-2">
							<Button
								type="button"
								variant="outline"
								disabled={cancelMutation.isPending}
								onClick={() => onOpenChange(false)}
							>
								Keep Requisition
							</Button>
							<Button
								type="button"
								variant="destructive"
								disabled={cancelMutation.isPending}
								onClick={handleConfirmCancel}
							>
								{cancelMutation.isPending
									? "Cancelling..."
									: "Cancel Requisition"}
							</Button>
						</DialogFooter>
					</>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
