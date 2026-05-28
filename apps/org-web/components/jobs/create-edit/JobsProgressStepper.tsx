"use client";

import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import {
	Calendar,
	CheckCircle,
	ClipboardList,
	Cog,
	FileText,
	Send,
} from "lucide-react";
import { JOB_POSTING_STEPS } from "@/constants/job-posting-flow";

const STEP_ICONS = [
	FileText,
	ClipboardList,
	FileText,
	Send,
	Cog,
	CheckCircle,
] as const;

interface JobsProgressStepperProps {
	currentStep: number;
	onStepClick?: (stepIndex: number) => void;
	/** Blocks navigation while create/update requisition is in flight. */
	disableNavigation?: boolean;
}

export function JobsProgressStepper({
	currentStep,
	onStepClick,
	disableNavigation = false,
}: Readonly<JobsProgressStepperProps>) {
	return (
		<div className="flex w-full items-center px-2 py-4">
			{JOB_POSTING_STEPS.map((step, index) => {
				const Icon = STEP_ICONS[index] ?? Calendar;
				const isCompleted = index < currentStep;
				const isCurrent = index === currentStep;
				const isLast = index === JOB_POSTING_STEPS.length - 1;
				const isFuture = index > currentStep;
				const isStepDisabled = disableNavigation || isFuture;

				return (
					<div
						key={step}
						className={`flex items-center ${isLast ? "" : "flex-1"}`}
					>
						<button
							type="button"
							disabled={isStepDisabled}
							className="flex shrink-0 flex-col items-center gap-1 p-2 disabled:pointer-events-none disabled:opacity-40"
							onClick={() => {
								if (isStepDisabled) return;
								onStepClick?.(index);
							}}
						>
							<Badge
								variant={isCompleted || isCurrent ? "default" : "secondary"}
								className="size-10 rounded-full [&>svg]:size-4"
							>
								{isCompleted ? <CheckCircle /> : <Icon />}
							</Badge>
							<span
								className={`hidden max-w-24 text-center text-xs font-semibold sm:block ${isCurrent || isCompleted ? "text-primary" : "text-muted-foreground"}`}
							>
								{step}
							</span>
						</button>
						{!isLast && (
							<Separator
								className={`mx-1 h-px flex-1 ${isCompleted ? "bg-primary" : ""}`}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
