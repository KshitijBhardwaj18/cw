"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import {
	GRIEVANCE_STATUS,
	type GrievanceStatus,
	getGrievanceFlowStepIndex,
} from "@/constants/grievances";

const FLOW_LABELS: { status: GrievanceStatus; label: string }[] = [
	{ status: GRIEVANCE_STATUS.OPEN, label: "Open" },
	{ status: GRIEVANCE_STATUS.IN_PROGRESS, label: "In Progress" },
	{ status: GRIEVANCE_STATUS.RESOLVED, label: "Resolved" },
];

const STEP_ICONS = [Clock, AlertTriangle, CheckCircle2] as const;

interface GrievanceStatusFlowCardProps {
	status: GrievanceStatus;
	completedTaskCount: number;
	totalTaskCount: number;
	className?: string;
}

export function GrievanceStatusFlowCard({
	status,
	completedTaskCount,
	totalTaskCount,
	className,
}: GrievanceStatusFlowCardProps) {
	const currentIndex = getGrievanceFlowStepIndex(status);
	const progressPct =
		totalTaskCount === 0
			? 0
			: Math.round((completedTaskCount / totalTaskCount) * 100);

	return (
		<Card className={cn(className)}>
			<CardHeader>
				<CardTitle className="text-base">Grievance Status Flow</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex w-full items-center px-1 py-2">
					{FLOW_LABELS.map((step, index) => {
						const Icon = STEP_ICONS[index];
						const isCompleted = index < currentIndex;
						const isCurrent = index === currentIndex;
						const isLast = index === FLOW_LABELS.length - 1;

						return (
							<div
								key={step.status}
								className={cn("flex items-center", !isLast && "flex-1")}
							>
								<Button
									type="button"
									variant="ghost"
									className="group flex h-auto shrink-0 flex-col items-center gap-1 rounded-lg p-2 hover:bg-transparent"
								>
									<Badge
										variant={isCompleted || isCurrent ? "default" : "secondary"}
										className={cn(
											"size-12 rounded-full [&>svg]:size-5",
											isCurrent &&
												"ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
										)}
									>
										{isCompleted ? (
											<CheckCircle2 className="text-primary-foreground" />
										) : (
											<Icon
												className={
													isCurrent
														? "text-primary-foreground"
														: "text-muted-foreground"
												}
											/>
										)}
									</Badge>
									<span
										className={cn(
											"hidden max-w-28 text-center text-xs font-semibold sm:block",
											isCurrent || isCompleted
												? "text-primary"
												: "text-muted-foreground",
										)}
									>
										{step.label}
									</span>
								</Button>

								{!isLast && (
									<Separator
										className={cn(
											"mx-1 h-px flex-1",
											isCompleted ? "bg-primary" : "bg-border",
										)}
									/>
								)}
							</div>
						);
					})}
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between gap-2 text-sm">
						<span className="text-muted-foreground font-medium">
							Task Progress
						</span>
						<span className="text-muted-foreground tabular-nums">
							{completedTaskCount} of {totalTaskCount} tasks completed
						</span>
					</div>
					<Progress value={progressPct} className="h-2" />
				</div>
			</CardContent>
		</Card>
	);
}
