"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Check } from "lucide-react";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import type { PlacementTask } from "@/types/placement";

interface PlacementTaskCardProps {
	task: PlacementTask;
	onMarkComplete?: (task: PlacementTask) => void;
}

export function PlacementTaskCard({
	task,
	onMarkComplete,
}: Readonly<PlacementTaskCardProps>) {
	const isPending = task.status === "pending";
	const { fmtShortDate } = useUserTimezone();

	return (
		<Card className="border">
			<CardContent>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex flex-wrap items-center gap-2">
						<Badge
							variant="secondary"
							className={
								isPending
									? "bg-amber-100 text-amber-800"
									: "bg-slate-100 text-slate-700"
							}
						>
							{isPending ? "Pending" : "Completed"}
						</Badge>
						<span className="text-muted-foreground text-sm">
							Due: {fmtShortDate(task.dueDate)}
						</span>
					</div>
					{isPending && onMarkComplete && (
						<Button
							size="sm"
							variant="default"
							className="bg-emerald-600 hover:bg-emerald-700 text-xs"
							onClick={() => onMarkComplete(task)}
						>
							<Check className="size-3" data-icon="inline-start" />
							Mark Complete
						</Button>
					)}
				</div>
				<div className="mt-2 space-y-1">
					<p className="font-medium">{task.title}</p>
					{task.description && (
						<p className="text-muted-foreground text-sm">{task.description}</p>
					)}
					<p className="text-muted-foreground text-xs">
						Assigned to: {task.assignedTo} • Created by: {task.createdBy}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
