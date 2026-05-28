"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import {
	Briefcase,
	CheckCircle,
	FileText,
	Settings,
	StickyNote,
	Users,
} from "lucide-react";

const VENDOR_ONBOARDING_STEPS = [
	{ key: "vendor-profile", label: "Vendor Profile" },
	{ key: "occupations", label: "Occupations" },
	{ key: "vendor-users", label: "Vendor Users" },
	{ key: "documents", label: "Documents" },
	{ key: "notes", label: "Notes" },
] as const;

const STEP_ICONS = [Briefcase, Settings, Users, FileText, StickyNote] as const;

interface VendorProgressBarProps {
	currentStep: number;
	vendorId?: string;
	onStepChange: (index: number) => void;
}

export function VendorProgressBar({
	currentStep,
	vendorId = "",
	onStepChange,
}: Readonly<VendorProgressBarProps>) {
	const normalizedVendorId = vendorId.trim();
	const isEditMode = normalizedVendorId.length > 0;

	const handleStepClick = (index: number) => {
		const isClickable = isEditMode || index <= currentStep;
		if (!isClickable) return;
		onStepChange(index);
	};

	return (
		<div className="flex w-full items-center py-4 px-2">
			{VENDOR_ONBOARDING_STEPS.map((step, index) => {
				const Icon = STEP_ICONS[index];
				const isCompleted = index < currentStep;
				const isCurrent = currentStep === index;
				const isLast = index === VENDOR_ONBOARDING_STEPS.length - 1;
				const isClickable = isEditMode || index <= currentStep;

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
								className={`size-[clamp(2.25rem,5vw,4rem)] rounded-full [&>svg]:size-[clamp(1rem,2.5vw,1.25rem)] ${!isCompleted && !isCurrent ? "group-hover:text-primary" : ""}`}
							>
								{isCompleted ? <CheckCircle /> : <Icon />}
							</Badge>
							<span
								className={`hidden sm:block text-[clamp(0.6rem,1.5vw,0.75rem)] font-semibold text-center max-w-24 text-muted-foreground ${!isCompleted && !isCurrent ? "group-hover:text-primary" : ""} ${isCurrent || isCompleted ? "text-primary" : ""}`}
							>
								{step.label}
							</span>
						</Button>

						{!isLast && (
							<Separator
								className={`mx-1 flex-1 h-1! ${isCompleted ? "bg-primary" : ""}`}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
