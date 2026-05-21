"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, Check, Clock, Users } from "lucide-react";
import {
	SUBMISSION_AGING_STAT_CARDS,
	type SubmissionAgingFilter,
} from "@/constants/submissions";
import type { SubmissionAgingCounts } from "@/types/submissions";

const SUBMISSION_AGING_CARD_VARIANTS: Record<
	SubmissionAgingFilter,
	{
		cardClass: string;
		textClass: string;
		iconBgClass: string;
		icon: LucideIcon;
		activeClass: string;
	}
> = {
	ALL: {
		cardClass:
			"border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-950/40",
		textClass: "text-slate-800 dark:text-slate-200",
		iconBgClass:
			"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
		icon: Users,
		activeClass: "border-primary ring-1 ring-primary/20",
	},
	OVERDUE: {
		cardClass: "border-red-200 bg-red-50/50",
		textClass: "text-red-800",
		iconBgClass: "bg-red-100 text-red-700",
		icon: AlertCircle,
		activeClass: "border-red-400 ring-1 ring-red-200/60",
	},
	NEAR: {
		cardClass: "border-amber-200 bg-amber-50/50",
		textClass: "text-amber-800",
		iconBgClass: "bg-amber-100 text-amber-700",
		icon: Clock,
		activeClass: "border-amber-400 ring-1 ring-amber-200/60",
	},
	WITHIN: {
		cardClass: "border-emerald-200 bg-emerald-50/50",
		textClass: "text-emerald-800",
		iconBgClass: "bg-emerald-100 text-emerald-700",
		icon: Check,
		activeClass: "border-emerald-400 ring-1 ring-emerald-200/60",
	},
};

export interface SubmissionAgingStatCardsProps {
	agingFilter: SubmissionAgingFilter;
	agingCounts: SubmissionAgingCounts;
	onAgingFilterChange: (filter: SubmissionAgingFilter) => void;
}

export function SubmissionAgingStatCards({
	agingFilter,
	agingCounts,
	onAgingFilterChange,
}: SubmissionAgingStatCardsProps) {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{SUBMISSION_AGING_STAT_CARDS.map((card) => {
				const count =
					card.key === "ALL"
						? agingCounts.ALL
						: card.key === "OVERDUE"
							? agingCounts.OVERDUE
							: card.key === "NEAR"
								? agingCounts.NEAR
								: agingCounts.WITHIN;
				const isActive = agingFilter === card.key;
				const variant = SUBMISSION_AGING_CARD_VARIANTS[card.key];
				const Icon = variant.icon;
				return (
					<button
						key={card.key}
						type="button"
						onClick={() => onAgingFilterChange(card.key)}
						className="text-left"
					>
						<Card
							className={cn(
								"cursor-pointer border py-1 transition-all hover:shadow-sm",
								variant.cardClass,
								isActive ? variant.activeClass : "hover:brightness-[0.99]",
							)}
						>
							<CardContent className="relative p-4">
								<div className="flex items-start justify-between gap-2">
									<p className={cn("text-xs font-medium", variant.textClass)}>
										{card.label}
									</p>
									<div
										className={cn(
											"flex size-7 shrink-0 items-center justify-center rounded-full",
											variant.iconBgClass,
										)}
									>
										<Icon className="size-4" />
									</div>
								</div>
								<p className={cn("mt-1 text-2xl font-bold", variant.textClass)}>
									{count}
								</p>
								<p className={cn("mt-1 text-xs opacity-90", variant.textClass)}>
									{card.hint}
								</p>
							</CardContent>
						</Card>
					</button>
				);
			})}
		</div>
	);
}
