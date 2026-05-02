"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { Calendar, CheckCircle2, User } from "lucide-react";
import type { GrievanceTaskUiState } from "@/constants/grievances";
import { formatGrievanceDate } from "@/utils/grievances";

const STATUS_LABEL: Record<GrievanceTaskUiState, string> = {
	pending: "Pending",
	in_progress: "In Progress",
	completed: "Completed",
};

function statusBadgeClass(ui: GrievanceTaskUiState): string {
	if (ui === "pending") {
		return "bg-muted text-muted-foreground border border-border";
	}
	if (ui === "in_progress") {
		return "bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-100";
	}
	return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100";
}

interface GrievanceTaskItemProps {
	title: string;
	description: string;
	assigneeName: string;
	createdAtIso: string;
	uiState: GrievanceTaskUiState;
	completedAtIso?: string;
	onCycleState: () => void;
	canCycleState?: boolean;
}

export function GrievanceTaskItem({
	title,
	description,
	assigneeName,
	createdAtIso,
	uiState,
	completedAtIso,
	onCycleState,
	canCycleState = false,
}: GrievanceTaskItemProps) {
	const statusControl = (
		<span
			className={cn(
				"flex size-8 items-center justify-center rounded-md border-2 transition-colors",
				uiState === "pending" && "border-muted-foreground/35 bg-background",
				uiState === "in_progress" && "border-sky-600 bg-sky-600",
				uiState === "completed" && "border-emerald-500 bg-emerald-500",
			)}
		>
			{uiState === "pending" && (
				<span className="size-3 rounded-sm bg-transparent" />
			)}
			{uiState === "in_progress" && (
				<span className="size-2 rounded-full bg-white" />
			)}
			{uiState === "completed" && (
				<CheckCircle2 className="size-5 text-white" strokeWidth={2.5} />
			)}
		</span>
	);

	return (
		<div className="flex gap-3 rounded-lg border bg-card p-4">
			{canCycleState ? (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="shrink-0 rounded-md p-0 hover:bg-transparent"
					onClick={onCycleState}
					aria-label={`Change task status. Current: ${STATUS_LABEL[uiState]}`}
				>
					{statusControl}
				</Button>
			) : (
				<div
					className="shrink-0 pt-0.5"
					title={`Task status: ${STATUS_LABEL[uiState]}`}
				>
					{statusControl}
				</div>
			)}

			<div className="min-w-0 flex-1 space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<h4 className="font-semibold leading-tight">{title}</h4>
					<Badge
						variant="secondary"
						className={cn("font-medium", statusBadgeClass(uiState))}
					>
						{STATUS_LABEL[uiState]}
					</Badge>
				</div>
				<p className="text-muted-foreground text-sm leading-relaxed">
					{description}
				</p>
				<div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
					<span className="inline-flex items-center gap-1.5">
						<User className="size-3.5 shrink-0 opacity-70" />
						Assigned to: {assigneeName}
					</span>
					<span className="inline-flex items-center gap-1.5">
						<Calendar className="size-3.5 shrink-0 opacity-70" />
						Created: {formatGrievanceDate(createdAtIso)}
					</span>
					{uiState === "completed" && completedAtIso && (
						<span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
							<CheckCircle2 className="size-3.5 shrink-0" />
							Completed: {formatGrievanceDate(completedAtIso)}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
