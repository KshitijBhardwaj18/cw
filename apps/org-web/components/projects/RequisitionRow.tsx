"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { Briefcase, Calendar, DollarSign, MapPin, X } from "lucide-react";
import type { ProjectRequisitionStatus } from "@/types/project";

interface RequisitionRowProps {
	requisitionId: string;
	title: string;
	occupation: string;
	location: string;
	rateLabel: string;
	openPositions: number;
	specialty: string;
	startDateLabel: string;
	status: ProjectRequisitionStatus;
	onRemove: () => void;
}

const STATUS_LABELS: Record<ProjectRequisitionStatus, string> = {
	DRAFT: "Draft",
	ACTIVE: "Active",
	INACTIVE: "Inactive",
	PENDING_APPROVAL: "Pending Approval",
	APPROVED: "Approved",
	PUBLISHED: "Published",
	ON_HOLD: "On Hold",
	FILLED: "Filled",
	CANCELLED: "Cancelled",
	CLOSED: "Closed",
};

const STATUS_CLASSES: Record<ProjectRequisitionStatus, string> = {
	DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
	ACTIVE: "bg-green-100 text-green-700 border-green-200",
	INACTIVE: "bg-gray-100 text-gray-700 border-gray-200",
	PENDING_APPROVAL: "bg-amber-100 text-amber-700 border-amber-200",
	APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
	PUBLISHED: "bg-green-100 text-green-700 border-green-200",
	ON_HOLD: "bg-amber-100 text-amber-700 border-amber-200",
	FILLED: "bg-violet-100 text-violet-700 border-violet-200",
	CANCELLED: "bg-red-100 text-red-700 border-red-200",
	CLOSED: "bg-gray-100 text-gray-700 border-gray-200",
};

export function RequisitionRow({
	requisitionId,
	title,
	occupation,
	location,
	rateLabel,
	openPositions,
	specialty,
	startDateLabel,
	status,
	onRemove,
}: Readonly<RequisitionRowProps>) {
	return (
		<div className="group border-t px-6 py-5 transition-colors hover:bg-accent/50">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-3 flex-1 min-w-0">
					<div className="flex items-center gap-3">
						<h4 className="text-base font-semibold text-foreground truncate">
							{title}
						</h4>
						<span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded tracking-wide uppercase">
							{requisitionId}
						</span>
						<Badge
							variant="secondary"
							className={cn(
								"font-medium h-5 px-2 text-[10px] uppercase tracking-wider shrink-0",
								STATUS_CLASSES[status],
							)}
						>
							{STATUS_LABELS[status]}
						</Badge>
					</div>

					<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
						<div className="flex items-center gap-1.5 min-w-0">
							<Briefcase className="size-4 shrink-0 text-muted-foreground/70" />
							<span className="truncate">{occupation}</span>
						</div>
						<div className="flex items-center gap-1.5 min-w-0">
							<MapPin className="size-4 shrink-0 text-muted-foreground/70" />
							<span className="truncate">{location}</span>
						</div>
						<div className="flex items-center gap-1.5 shrink-0">
							<DollarSign className="size-4 shrink-0 text-muted-foreground/70" />
							<span>{rateLabel}</span>
						</div>
						<div className="flex items-center gap-1.5 shrink-0">
							<Calendar className="size-4 shrink-0 text-muted-foreground/70" />
							<span>{startDateLabel}</span>
						</div>
					</div>

					<div className="flex items-center gap-3 text-sm">
						<div className="flex items-center gap-1.5 font-medium text-foreground/80 lowercase">
							<span className="text-primary font-bold">{openPositions}</span>
							<span>open position{openPositions === 1 ? "" : "s"}</span>
						</div>
						<div className="h-3 w-px bg-border" />
						<span className="text-muted-foreground font-medium">
							{specialty}
						</span>
					</div>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive hover:bg-destructive/10 group-hover:opacity-100 size-8 shrink-0"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onRemove();
					}}
					aria-label={`Remove ${title}`}
				>
					<X className="size-4" />
				</Button>
			</div>
		</div>
	);
}
