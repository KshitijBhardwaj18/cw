"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import {
	Briefcase,
	Building2,
	CheckCircle,
	ClipboardList,
	MapPin,
	ShieldCheck,
	UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";

type SignUpStepConfig = {
	key: string;
	label: string;
	/** Narrow screens: shorter label to avoid cramped stepper */
	shortLabel?: string;
};

const SIGN_UP_STEPS: readonly SignUpStepConfig[] = [
	{ key: "create-account", label: "Create Account", shortLabel: "Account" },
	{ key: "contact-info", label: "Contact Information", shortLabel: "Contact" },
	{
		key: "professional-details",
		label: "Professional Details",
		shortLabel: "Professional",
	},
	{
		key: "location-preferences",
		label: "Location Preferences",
		shortLabel: "Locations",
	},
	{
		key: "preferences-questionnaires",
		label: "Preferences & Questionnaires",
		shortLabel: "Preferences",
	},
	{
		key: "submission-readiness",
		label: "Submission Readiness",
		shortLabel: "Submission",
	},
] as const;

const STEP_ICONS = [
	UserPlus,
	MapPin,
	Briefcase,
	Building2,
	ClipboardList,
	ShieldCheck,
] as const;

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
		<div className="w-full min-w-0 px-1 py-4 sm:px-2">
			{/* Horizontal scroll on very narrow viewports so six steps never overlap */}
			<div className="-mx-1 overflow-x-auto overflow-y-visible px-1 sm:mx-0 sm:overflow-visible">
				<div className="flex min-w-[36rem] items-center sm:min-w-0">
					{steps.map((step, index) => {
						const Icon = icons[index];
						const isCompleted = index < currentStep;
						const isCurrent = currentStep === index;
						const isLast = index === steps.length - 1;
						const isClickable = index <= currentStep;

						return (
							<div
								key={step.key}
								className={cn(
									"flex min-w-[4.25rem] flex-1 items-center sm:min-w-0",
								)}
							>
								<Button
									type="button"
									variant="ghost"
									onClick={() => handleStepClick(index)}
									disabled={!isClickable}
									className="group flex h-auto min-w-0 w-full shrink flex-col items-center gap-1.5 rounded-lg p-1.5 hover:bg-transparent sm:p-2"
								>
									<Badge
										variant={isCompleted || isCurrent ? "default" : "secondary"}
										className={cn(
											"size-11 shrink-0 rounded-full [&>svg]:size-[1.125rem] sm:size-12 sm:[&>svg]:size-5",
											!isCompleted && !isCurrent
												? "group-hover:text-primary"
												: "",
										)}
									>
										{isCompleted ? <CheckCircle /> : <Icon />}
									</Badge>
									<span
										className={cn(
											"w-full whitespace-normal break-words px-0.5 text-center text-[10px] font-semibold leading-tight tracking-tight sm:text-[11px] md:text-xs",
											isCurrent || isCompleted
												? "text-primary"
												: "text-muted-foreground group-hover:text-primary",
										)}
									>
										<span className="md:hidden">
											{step.shortLabel ?? step.label}
										</span>
										<span className="hidden md:inline">{step.label}</span>
									</span>
								</Button>

								{!isLast && (
									<Separator
										className={cn(
											"mx-px h-px min-w-[6px] flex-1 md:mx-1",
											isCompleted ? "bg-primary" : "",
										)}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
