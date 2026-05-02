"use client";

import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
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
}

export function RequisitionTemplateProgress({
	currentStep,
}: RequisitionTemplateProgressProps) {
	return (
		<div className="flex w-full items-center py-4 px-2">
			{REQUISITION_TEMPLATE_STEPS.map((step, index) => {
				const Icon = STEP_ICONS[index];
				const isCompleted = index < currentStep;
				const isCurrent = currentStep === index;
				const isLast = index === REQUISITION_TEMPLATE_STEPS.length - 1;

				return (
					<div
						key={step.key}
						className={`flex items-center ${isLast ? "" : "flex-1"}`}
					>
						<div className="flex shrink-0 flex-col items-center gap-1 p-2">
							<Badge
								variant={isCompleted || isCurrent ? "default" : "secondary"}
								className={`size-12 rounded-full [&>svg]:size-5`}
							>
								{isCompleted ? <CheckCircle /> : <Icon />}
							</Badge>
							<span
								className={`hidden max-w-24 text-center text-xs font-semibold sm:block ${isCurrent || isCompleted ? "text-primary" : "text-muted-foreground"}`}
							>
								{step.label}
							</span>
						</div>

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
