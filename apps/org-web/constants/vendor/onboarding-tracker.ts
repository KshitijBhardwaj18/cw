import {
	AlertCircleIcon,
	CheckCircle2Icon,
	ClockIcon,
	type LucideIcon,
} from "lucide-react";
import type {
	OnboardingDocStatus,
	OnboardingStatus,
} from "@/types/vendor-onboarding-tracker";

export const STATUS_VARIANT_MAP: Record<
	OnboardingStatus,
	"success" | "warning" | "error" | "secondary"
> = {
	Cleared: "success",
	"In-Progress": "warning",
	"Behind Schedule": "error",
};

export const DOC_STATUS_COLOR_MAP: Record<OnboardingDocStatus, string> = {
	complete: "bg-emerald-500",
	"in-progress": "bg-amber-500",
	missing: "bg-rose-500",
	pending: "bg-amber-500",
};

export const DOC_INDICATOR_MAP: Record<OnboardingDocStatus, string> = {
	complete: "[&>[data-slot=progress-indicator]]:bg-emerald-500",
	"in-progress": "[&>[data-slot=progress-indicator]]:bg-amber-500",
	missing: "[&>[data-slot=progress-indicator]]:bg-rose-500",
	pending: "[&>[data-slot=progress-indicator]]:bg-amber-500",
};

export const PROGRESS_COLOR_MAP: Record<OnboardingStatus, string> = {
	Cleared: "bg-emerald-500",
	"In-Progress": "bg-amber-500",
	"Behind Schedule": "bg-rose-500",
};

export const PROGRESS_INDICATOR_MAP: Record<OnboardingStatus, string> = {
	Cleared: "[&>[data-slot=progress-indicator]]:bg-emerald-500",
	"In-Progress": "[&>[data-slot=progress-indicator]]:bg-amber-500",
	"Behind Schedule": "[&>[data-slot=progress-indicator]]:bg-rose-500",
};

export const DOCUMENT_STATUS_CONFIG: Record<
	OnboardingDocStatus,
	{
		label: string;
		icon: LucideIcon;
		variant: "success" | "warning" | "error";
	}
> = {
	complete: {
		label: "Complete",
		icon: CheckCircle2Icon,
		variant: "success",
	},
	pending: {
		label: "Pending",
		icon: ClockIcon,
		variant: "warning",
	},
	missing: {
		label: "Missing",
		icon: AlertCircleIcon,
		variant: "error",
	},
	"in-progress": {
		label: "In Progress",
		icon: ClockIcon,
		variant: "warning",
	},
};
