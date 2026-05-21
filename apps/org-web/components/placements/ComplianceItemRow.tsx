"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Check,
	ChevronDown,
	ChevronRight,
	Clock,
	FileText,
	Trash2,
	X,
} from "lucide-react";
import type { PlacementComplianceItemRow } from "@/types/placement-compliance";

const STATUS_BADGE_CONFIG = {
	missing: {
		label: "Missing",
		className: "bg-red-100 text-red-800 border-red-200",
		icon: X,
	},
	approved: {
		label: "Approved",
		className: "bg-emerald-100 text-emerald-800 border-emerald-200",
		icon: Check,
	},
	expired: {
		label: "Expired",
		className: "bg-amber-100 text-amber-800 border-amber-200",
		icon: X,
	},
	pending: {
		label: "Pending review",
		className: "bg-sky-100 text-sky-800 border-sky-200",
		icon: Clock,
	},
} as const;

interface ComplianceItemRowProps {
	item: PlacementComplianceItemRow;
	isAuditExpanded: boolean;
	onRemove: (itemId: string) => void;
	onToggleAudit: (itemId: string) => void;
	mode: "org" | "vendor";
	canRemovePlacementExtras?: boolean;
}

export function ComplianceItemRow({
	item,
	isAuditExpanded,
	onRemove,
	onToggleAudit,
	mode = "org",
	canRemovePlacementExtras = false,
}: ComplianceItemRowProps) {
	const statusConfig =
		STATUS_BADGE_CONFIG[item.status] ?? STATUS_BADGE_CONFIG.missing;
	const StatusIcon = statusConfig.icon;
	const removeId = item.placementComplianceItemId;

	return (
		<div className="bg-muted/20 px-4 py-4">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="flex items-start gap-3">
					<div className="bg-muted mt-0.5 size-2 shrink-0 rounded-full" />
					<div>
						<p className="font-medium">{item.name}</p>
						<p className="text-muted-foreground text-xs">{item.category}</p>
						<p className="text-muted-foreground mt-1 text-xs">
							Source:{" "}
							{item.source === "requisition" ? "Requisition" : "Placement"}
						</p>
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-muted-foreground text-xs uppercase">
						Status
					</span>
					<Badge
						variant="secondary"
						className={`flex w-fit items-center gap-1 border ${statusConfig.className}`}
					>
						<StatusIcon className="size-3.5" />
						{statusConfig.label}
					</Badge>
					{item.documentName && (
						<div className="flex items-center gap-1.5 text-xs">
							<FileText className="text-primary size-3.5" />
							<span className="text-muted-foreground truncate">
								{item.documentName}
							</span>
						</div>
					)}
				</div>
				<div className="flex flex-row gap-8">
					<div className="flex flex-col gap-1">
						<span className="text-muted-foreground text-xs uppercase">
							Completion Date
						</span>
						<span className="text-sm">{item.completionDate ?? "—"}</span>
					</div>
					{item.expirationDate != null && (
						<div className="flex flex-col gap-1">
							<span className="text-muted-foreground text-xs uppercase">
								Expiration Date
							</span>
							<span className="text-sm">{item.expirationDate}</span>
						</div>
					)}
				</div>
			</div>

			<div className="mt-3 flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					{mode === "org" &&
						canRemovePlacementExtras &&
						item.canRemove &&
						removeId && (
							<Button
								variant="outline"
								size="sm"
								className="text-destructive hover:bg-destructive/10 hover:text-destructive"
								onClick={() => onRemove(removeId)}
								type="button"
							>
								<Trash2 className="size-4" />
								Remove Item
							</Button>
						)}
				</div>
				{mode === "org" && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onToggleAudit(item.complianceListItemId)}
						type="button"
					>
						{isAuditExpanded ? (
							<>
								<ChevronDown className="size-4" />
								Audit Log
							</>
						) : (
							<>
								<ChevronRight className="size-4" />
								Audit Log
							</>
						)}
					</Button>
				)}
			</div>

			{isAuditExpanded && item.auditLog.length > 0 && (
				<div className="mt-4 space-y-3 rounded-md bg-muted/30 p-4">
					<h4 className="font-medium">Audit Log</h4>
					<div className="space-y-3">
						{item.auditLog.map((log, idx) => (
							<div key={idx} className="rounded-md border bg-background p-3">
								<p className="font-medium">
									{log.event}
									<span className="text-muted-foreground font-normal">
										{" "}
										• {log.date}
									</span>
								</p>
								<p className="text-muted-foreground mt-1 text-xs">
									Performed by: {log.performedBy}
								</p>
								<p className="text-muted-foreground mt-0.5 text-xs">
									{log.description}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
