"use client";

import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import { ArrowRight, Briefcase, Calendar, Clock, Users } from "lucide-react";
import type { ReactNode } from "react";
import { REQUISITION_TEMPLATE_TYPE_OPTIONS } from "@/constants/requisition-templates";
import type { RequisitionTemplateType } from "@/types/requisition-template";

const REQUISITION_TYPE_META: Record<
	RequisitionTemplateType,
	{
		description: string;
		features: string[];
		icon: ReactNode;
		iconBgClass: string;
	}
> = {
	LONG_TERM_ORDER: {
		description:
			"Temporary assignments with defined start and end dates, typically 8-26 weeks",
		features: [
			"Fixed duration contract",
			"Defined start and end dates",
			"Full-time or part-time schedules",
			"Compliance requirements tracked",
		],
		icon: <Calendar className="size-5" />,
		iconBgClass:
			"bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
	},
	PER_DIEM: {
		description: "Flexible shifts on an as-needed basis, paid per shift",
		features: [
			"Shift-by-shift basis",
			"Flexible scheduling",
			"No guaranteed hours",
			"Quick onboarding",
		],
		icon: <Clock className="size-5" />,
		iconBgClass:
			"bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
	},
	PERMANENT_ROLE: {
		description: "Full-time permanent positions with no defined end date",
		features: [
			"Indefinite employment",
			"Full benefits package",
			"Standard work schedule",
			"Long-term career opportunity",
		],
		icon: <Briefcase className="size-5" />,
		iconBgClass:
			"bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
	},
	INTERNAL_FLEX_POOL: {
		description:
			"Internal staff pool for flexible scheduling and cross-departmental coverage",
		features: [
			"Internal workforce pool",
			"Cross-departmental coverage",
			"Flexible assignment rotation",
			"Maintained internal relationships",
		],
		icon: <Users className="size-5" />,
		iconBgClass:
			"bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
	},
};

interface RequisitionTypeSelectionCardsProps {
	selectedType: RequisitionTemplateType | null;
	onSelectType: (type: RequisitionTemplateType) => void;
	disabled?: boolean;
	actionText?: string;
	className?: string;
}

export function RequisitionTypeSelectionCards({
	selectedType,
	onSelectType,
	disabled = false,
	actionText = "Select this type →",
	className,
}: RequisitionTypeSelectionCardsProps) {
	return (
		<div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
			{REQUISITION_TEMPLATE_TYPE_OPTIONS.map((type) => {
				const meta = REQUISITION_TYPE_META[type.value];
				const isSelected = selectedType === type.value;

				return (
					<button
						key={type.value}
						type="button"
						onClick={() => onSelectType(type.value)}
						disabled={disabled}
						className={cn(
							"flex flex-col gap-3 rounded-lg border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm",
							isSelected && "border-primary ring-2 ring-primary/20",
						)}
					>
						<div
							className={cn(
								"flex size-10 shrink-0 items-center justify-center rounded-lg",
								meta.iconBgClass,
							)}
						>
							{meta.icon}
						</div>
						<div>
							<h3 className="font-semibold">{type.label}</h3>
							<p className="text-muted-foreground mt-1 text-sm">
								{meta.description}
							</p>
						</div>
						<ul className="text-muted-foreground space-y-1 text-sm">
							{meta.features.map((feature) => (
								<li key={feature} className="flex items-center gap-2">
									<ArrowRight className="size-3.5 shrink-0" />
									{feature}
								</li>
							))}
						</ul>
						<div className="mt-auto space-y-2">
							<Separator />
							<span className="text-primary text-sm font-medium">
								{actionText}
							</span>
						</div>
					</button>
				);
			})}
		</div>
	);
}
