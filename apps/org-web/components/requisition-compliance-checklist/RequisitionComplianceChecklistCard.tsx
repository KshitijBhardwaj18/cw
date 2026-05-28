"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Copy, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import type { RequisitionComplianceChecklistCardItem } from "@/types/requisition-compliance-checklist";

interface RequisitionComplianceChecklistCardProps {
	checklist: RequisitionComplianceChecklistCardItem;
	onView?: (id: string) => void;
	onEdit?: (id: string) => void;
	onDuplicate?: (id: string) => void;
	onDelete?: (id: string) => void;
}

export function RequisitionComplianceChecklistCard({
	checklist,
	onView,
	onEdit,
	onDuplicate,
	onDelete,
}: Readonly<RequisitionComplianceChecklistCardProps>) {
	const canDelete = checklist.linkedRequisitionCount === 0;

	return (
		<Card className="overflow-hidden transition-shadow hover:shadow-md">
			<CardContent className="flex flex-col gap-4 ">
				<div className="flex items-start gap-3">
					<div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
						<FileText className="text-primary size-5" />
					</div>
					<div className="min-w-0 flex-1">
						<h3 className="font-semibold leading-tight">{checklist.name}</h3>
						{checklist.description && (
							<p className="text-muted-foreground mt-0.5 text-sm">
								{checklist.description}
							</p>
						)}
					</div>
					<div className="flex shrink-0 items-center gap-1">
						{onView && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label="View checklist"
								onClick={() => onView(checklist.id)}
							>
								<Eye className="size-4" />
							</Button>
						)}
						{onEdit && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label="Edit checklist"
								onClick={() => onEdit(checklist.id)}
							>
								<Pencil className="size-4" />
							</Button>
						)}
						{onDuplicate && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label="Duplicate checklist"
								onClick={() => onDuplicate(checklist.id)}
							>
								<Copy className="size-4" />
							</Button>
						)}
						{onDelete && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="text-destructive hover:bg-destructive/10 hover:text-destructive"
								aria-label="Delete checklist"
								disabled={!canDelete}
								onClick={() => canDelete && onDelete(checklist.id)}
							>
								<Trash2
									className={`size-4 ${!canDelete ? "text-muted-foreground opacity-50" : ""}`}
								/>
							</Button>
						)}
					</div>
				</div>

				<div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
					<span>
						<strong className="text-foreground">Checklist Items:</strong>{" "}
						{checklist.checklistItemCount}
					</span>
					<span>
						<strong className="text-foreground">Linked Requisitions:</strong>{" "}
						{checklist.linkedRequisitionCount}
					</span>
					<span>
						<strong className="text-foreground">Last Modified:</strong>{" "}
						{checklist.lastModified}
					</span>
				</div>

				{!canDelete && checklist.linkedRequisitionCount > 0 && (
					<p className="text-muted-foreground border-t pt-3 text-xs">
						This template is linked to {checklist.linkedRequisitionCount}{" "}
						requisition template
						{checklist.linkedRequisitionCount !== 1 ? "s" : ""} and cannot be
						deleted.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
