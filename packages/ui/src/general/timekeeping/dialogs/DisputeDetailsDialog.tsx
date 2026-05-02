"use client";

import { Badge, type BadgeVariants } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { DetailItem } from "@repo/ui/components/detail-item";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { ExternalLink, Paperclip } from "lucide-react";
import type { DisputeLogEntry } from "../types";

interface DisputeDetailsDialogProps {
	isOpen: boolean;
	onClose: () => void;
	dispute: DisputeLogEntry | null;
	onOpenSupportingDocument?: (key: string) => void | Promise<void>;
}

const statusStyles: Record<string, BadgeVariants> = {
	Open: "error",
	Resolved: "success",
	Rejected: "secondary",
};

export function DisputeDetailsDialog({
	isOpen,
	onClose,
	dispute,
	onOpenSupportingDocument,
}: DisputeDetailsDialogProps) {
	if (!dispute) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader className="border-b pb-4">
					<DialogTitle>Dispute Details</DialogTitle>
					<DialogDescription className="sr-only">
						View full history and details for this dispute.
					</DialogDescription>
				</DialogHeader>

				<div className="max-h-[70vh] space-y-4 overflow-y-auto px-1 py-4">
					<div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
						Dispute Information
					</div>

					<div className="space-y-4 text-sm">
						<DetailItem label="Worker" value={dispute.workerName} />
						<DetailItem label="Date" value={dispute.date} />
						<DetailItem label="Pay Code" value={dispute.payCode} />
						<DetailItem label="Hours" value={dispute.hours} />
						<DetailItem label="Dispute Reason" value={dispute.disputeReason} />
						<DetailItem
							label="Submitted By"
							value={`${dispute.submittedBy.name} (${dispute.submittedBy.role})`}
						/>
						<DetailItem
							label="Submitted Date"
							value={dispute.submittedBy.timestamp}
						/>

						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Status:</p>
							<Badge variant={statusStyles[dispute.status]}>
								{dispute.status}
							</Badge>
						</div>

						{dispute.resolvedAt && (
							<DetailItem label="Resolved Date" value={dispute.resolvedAt} />
						)}

						{dispute.resolution && (
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">
									Resolution Notes:
								</p>
								<p className="text-sm font-medium italic text-foreground">
									{dispute.resolution}
								</p>
							</div>
						)}

						{(dispute.supportingDocuments?.length ?? 0) > 0 && (
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">
									Supporting Documents:
								</p>
								<div className="space-y-2">
									{dispute.supportingDocuments?.map((doc) => (
										<div
											key={doc.key}
											className="flex items-center justify-between rounded-md border p-2"
										>
											<div className="flex items-center gap-2 truncate">
												<Paperclip className="size-4 text-muted-foreground" />
												<span className="truncate text-sm">{doc.name}</span>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => onOpenSupportingDocument?.(doc.key)}
											>
												<ExternalLink className="size-4" />
												Open
											</Button>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="flex justify-end pt-4 border-t">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="min-w-[80px]"
					>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
