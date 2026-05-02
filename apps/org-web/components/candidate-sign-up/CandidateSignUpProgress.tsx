"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import {
	Briefcase,
	Building2,
	CheckCircle,
	MapPin,
	UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";

const SIGN_UP_STEPS = [
	{ key: "create-account", label: "Create Account" },
	{ key: "contact-info", label: "Contact Information" },
	{ key: "professional-details", label: "Professional Details" },
	{ key: "location-preferences", label: "Location Preferences" },
] as const;

const STEP_ICONS = [UserPlus, MapPin, Briefcase, Building2] as const;

interface CandidateSignUpProgressProps {
	currentStep: number;
	isInviteMode?: boolean;
}

export function CandidateSignUpProgress({
	currentStep,
	isInviteMode,
}: CandidateSignUpProgressProps) {
	const router = useRouter();
	const steps = SIGN_UP_STEPS;
	const icons = STEP_ICONS;

	const handleStepClick = (index: number) => {
		if (index > currentStep) return;
		if (isInviteMode && index === 0 && currentStep > 0) return;
		const params = new URLSearchParams({ step: String(index) });
		if (isInviteMode) params.set("invite", "true");
		router.push(`/candidate/sign-up?${params}`);
	};

	return (
		<div className="flex w-full items-center py-4 px-2">
			{steps.map((step, index) => {
				const Icon = icons[index];
				const isCompleted = index < currentStep;
				const isCurrent = currentStep === index;
				const isLast = index === steps.length - 1;
				const isClickable = index <= currentStep;

				return (
					<div
						key={step.key}
						className={`flex items-center ${isLast ? "" : "flex-1"}`}
					>
						<Button
							type="button"
							variant="ghost"
							onClick={() => handleStepClick(index)}
							disabled={!isClickable}
							className="group flex shrink-0 flex-col items-center gap-1 h-auto p-2 rounded-lg hover:bg-transparent"
						>
							<Badge
								variant={isCompleted || isCurrent ? "default" : "secondary"}
								className={`size-12 rounded-full [&>svg]:size-5 ${!isCompleted && !isCurrent ? "group-hover:text-primary" : ""}`}
							>
								{isCompleted ? <CheckCircle /> : <Icon />}
							</Badge>
							<span
								className={`hidden sm:block text-xs font-semibold text-center max-w-24 ${isCurrent || isCompleted ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
							>
								{step.label}
							</span>
						</Button>

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
