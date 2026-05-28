"use client";

import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import {
	Calendar,
	CheckCircle,
	DollarSign,
	FileText,
	Shield,
	Users,
} from "lucide-react";

const REQUISITION_TEMPLATE_STEPS = [
	{ key: "template-details", label: "Template Details" },
	{ key: "shift-schedule", label: "Shift & Schedule" },
	{ key: "compensation", label: "Compensation" },
	{ key: "compliance-checklist", label: "Compliance Checklist" },
	{ key: "submission-rules", label: "Submission Rules" },
] as const;

const STEP_ICONS = [FileText, Calendar, DollarSign, Shield, Users] as const;

interface RequisitionTemplateProgressProps {
	currentStep: number;
	onClickStep: (step: number) => void;
	canJumpToStep: (step: number) => boolean;
}

export function RequisitionTemplateProgress({
	currentStep,
	onClickStep,
	canJumpToStep,
}: Readonly<RequisitionTemplateProgressProps>) {
	return (
		<div className="flex w-full items-center py-4 px-2">
			{REQUISITION_TEMPLATE_STEPS.map((step, index) => {
				const Icon = STEP_ICONS[index];
				const isCompleted = index < currentStep;
				const isCurrent = currentStep === index;
				const isLast = index === REQUISITION_TEMPLATE_STEPS.length - 1;
				const canJump = canJumpToStep(index);

				return (
					<button
						key={step.key}
						type="button"
						className={cn("flex items-center group", !isLast && "flex-1")}
						onClick={() => onClickStep(index)}
						disabled={!canJump}
					>
						<div className="flex shrink-0 flex-col items-center gap-1 p-2">
							<Badge
								variant={isCompleted || isCurrent ? "default" : "secondary"}
								className={cn(
									"size-12 rounded-full [&>svg]:size-5 transition-colors",
									canJump && index > currentStep && "group-hover:text-primary",
								)}
							>
								{isCompleted ? <CheckCircle /> : <Icon />}
							</Badge>
							<span
								className={cn(
									"hidden max-w-24 text-center text-xs font-semibold sm:block transition-colors",
									canJump && index > currentStep && "group-hover:text-primary",
									isCurrent || isCompleted
										? "text-primary"
										: "text-muted-foreground",
								)}
							>
								{step.label}
							</span>
						</div>

						{!isLast && (
							<Separator
								className={`mx-1 h-px flex-1 ${isCompleted ? "bg-primary" : ""}`}
							/>
						)}
					</button>
				);
			})}
		</div>
	);
}
