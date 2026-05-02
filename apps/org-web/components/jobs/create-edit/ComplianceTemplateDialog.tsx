"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { useOrgContext } from "@/contexts/org-context";
import { useComplianceChecklist } from "@/queries/compliance-checklist.queries";
import { complianceChecklistToItemOptions } from "@/utils/compliance-checklist-display";

interface ComplianceTemplateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	complianceTemplateId: string;
	showInheritedDescription?: boolean;
}

export function ComplianceTemplateDialog({
	open,
	onOpenChange,
	complianceTemplateId,
	showInheritedDescription = false,
}: ComplianceTemplateDialogProps) {
	const { id: orgId } = useOrgContext();
	const checklistQuery = useComplianceChecklist(orgId, complianceTemplateId);

	const checklistItems = useMemo(
		() => complianceChecklistToItemOptions(checklistQuery.data),
		[checklistQuery.data],
	);

	const complianceTemplateLabel =
		checklistQuery.data?.name?.trim() ||
		(complianceTemplateId ? complianceTemplateId : "Compliance checklist");
	const statusLabel = checklistQuery.data
		? checklistQuery.data.isActive
			? "Active"
			: "Inactive"
		: checklistQuery.isLoading
			? "Loading…"
			: "—";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] min-w-4xl overflow-hidden">
				<DialogHeader>
					<DialogTitle>{complianceTemplateLabel}</DialogTitle>
					{showInheritedDescription && (
						<DialogDescription>
							This template is inherited from the selected requisition template.
						</DialogDescription>
					)}
				</DialogHeader>

				<div className="grid gap-4 md:grid-cols-[1fr_280px]">
					<div className="space-y-3">
						<h4 className="font-semibold text-sm">
							Required Documents & Credentials
						</h4>
						<ScrollArea className="h-105 rounded-md border p-3">
							<div className="space-y-2">
								{checklistQuery.isError && (
									<p className="text-destructive text-sm">
										Could not load checklist items. Try again later.
									</p>
								)}
								{checklistQuery.isLoading && (
									<p className="text-muted-foreground text-sm">
										Loading checklist…
									</p>
								)}
								{!checklistQuery.isLoading &&
									!checklistQuery.isError &&
									checklistItems.length === 0 && (
										<p className="text-muted-foreground text-sm">
											No items on this template.
										</p>
									)}
								{checklistItems.map((item) => (
									<div
										key={item.id}
										className="flex items-start justify-between gap-3 rounded-md border p-3"
									>
										<div className="flex min-w-0 items-start gap-2">
											<div className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary">
												<ShieldCheck className="size-4" />
											</div>
											<div className="min-w-0">
												<p className="font-medium text-sm">{item.name}</p>
												<p className="text-muted-foreground text-xs">
													{item.category}
													{item.tracksExpiration
														? " • Expiration tracking enabled"
														: " • No expiration tracking"}
												</p>
											</div>
										</div>
										<Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
											Required
										</Badge>
									</div>
								))}
							</div>
						</ScrollArea>
					</div>

					<div className="space-y-3">
						<div className="rounded-lg border p-3">
							<h4 className="mb-2 font-semibold text-sm">
								Template Information
							</h4>
							<div className="space-y-2">
								<DetailItem
									label="Template Name"
									value={complianceTemplateLabel}
								/>
								<DetailItem label="Type" value="Compliance checklist" />
								<DetailItem
									label="Description"
									value={checklistQuery.data?.description?.trim() || "—"}
								/>
								<DetailItem label="Status" value={statusLabel} />
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
