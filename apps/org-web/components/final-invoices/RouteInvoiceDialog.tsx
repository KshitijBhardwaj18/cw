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
import { Label } from "@repo/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { Separator } from "@repo/ui/components/separator";
import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	useInvoiceApprovers,
	useRouteInvoiceForApproval,
} from "@/queries/billing.queries";
import type { FinalInvoiceListRow } from "@/services/billing.service";

export type RouteInvoiceDialogProps = {
	orgId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	invoice: FinalInvoiceListRow | null;
};

export function RouteInvoiceDialog({
	orgId,
	open,
	onOpenChange,
	invoice,
}: RouteInvoiceDialogProps) {
	const approversQuery = useInvoiceApprovers(orgId);
	const routeMutation = useRouteInvoiceForApproval(orgId);
	const [approverId, setApproverId] = useState("");

	function handleOpenChange(next: boolean) {
		if (!next) {
			setApproverId("");
		}
		onOpenChange(next);
	}

	async function handleSubmit() {
		if (!invoice || !approverId) {
			toast.error("Select an approver to continue.");
			return;
		}
		try {
			await routeMutation.mutateAsync({
				invoiceId: invoice.id,
				payload: { approverUserId: approverId },
			});
			const approver = (approversQuery.data ?? []).find(
				(o) => o.userId === approverId,
			);
			toast.success("Invoice routed for approval", {
				description: `${invoice.invoiceNumber} sent to ${approver?.name ?? "approver"}.`,
			});
			handleOpenChange(false);
		} catch (e) {
			toast.error(
				e instanceof Error ? e.message : "Failed to route invoice for approval",
			);
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="gap-0 p-0 sm:max-w-lg" showCloseButton>
				<DialogHeader className="p-6 pb-4">
					<DialogTitle>Route Invoice for Approval</DialogTitle>
				</DialogHeader>
				<Separator />
				<div className="space-y-4 p-6 pt-4">
					{invoice ? (
						<div className="text-sm">
							<p>
								<span className="text-muted-foreground">Invoice: </span>
								<span className="font-semibold">{invoice.invoiceNumber}</span>
							</p>
							<p className="mt-1">
								<span className="text-muted-foreground">Amount: </span>
								<span className="font-semibold">
									{formatCurrency(invoice.totalAmount)}
								</span>
								<span className="text-muted-foreground"> · Vendor: </span>
								<span className="font-semibold">
									{invoice.vendor?.name ?? "Unassigned"}
								</span>
							</p>
						</div>
					) : null}

					<div className="space-y-2">
						<Label htmlFor="final-invoice-approver">
							Select approver <span className="text-destructive">*</span>
						</Label>
						<Select value={approverId} onValueChange={setApproverId}>
							<SelectTrigger
								id="final-invoice-approver"
								className="w-full"
								aria-required
							>
								<SelectValue placeholder="-- Select an approver --" />
							</SelectTrigger>
							<SelectContent>
								{(approversQuery.data ?? []).map((opt) => (
									<SelectItem key={opt.userId} value={opt.userId}>
										{opt.name} ({opt.role})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs">
							Approver must be Organization Finance or Admin role
						</p>
					</div>
				</div>
				<Separator />
				<DialogFooter className="p-6 pt-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={routeMutation.isPending || approversQuery.isLoading}
					>
						<Send className="size-4" data-icon="inline-start" />
						{routeMutation.isPending ? "Routing..." : "Route for Approval"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
