"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { AlertCircle, Check, Clock, X } from "lucide-react";

const STATUS_CARD_VARIANTS = {
	complete: {
		title: "Complete",
		description: "Candidate has valid document",
		icon: Check,
		cardClass: "border-emerald-200 bg-emerald-50/50",
		textClass: "text-emerald-800",
		iconBgClass: "bg-emerald-100 text-emerald-700",
	},
	missing: {
		title: "Missing",
		description: "Candidate has not provided",
		icon: X,
		cardClass: "border-red-200 bg-red-50/50",
		textClass: "text-red-800",
		iconBgClass: "bg-red-100 text-red-700",
	},
	expired: {
		title: "Expired",
		description: "Document needs renewal",
		icon: AlertCircle,
		cardClass: "border-amber-200 bg-amber-50/50",
		textClass: "text-amber-800",
		iconBgClass: "bg-amber-100 text-amber-700",
	},
	pending: {
		title: "Pending review",
		description: "Uploaded, awaiting verification",
		icon: Clock,
		cardClass: "border-sky-200 bg-sky-50/50",
		textClass: "text-sky-800",
		iconBgClass: "bg-sky-100 text-sky-700",
	},
} as const;

export type ComplianceStatusCardVariant = keyof typeof STATUS_CARD_VARIANTS;

interface ComplianceStatusCardProps {
	variant: ComplianceStatusCardVariant;
	count: number;
}

export function ComplianceStatusCard({
	variant,
	count,
}: Readonly<ComplianceStatusCardProps>) {
	const config = STATUS_CARD_VARIANTS[variant];
	const Icon = config.icon;
	return (
		<Card className={cn(config.cardClass)}>
			<CardContent>
				<div className="flex items-center justify-between">
					<span className={cn("text-sm font-medium", config.textClass)}>
						{config.title}
					</span>
					<div
						className={cn(
							"flex size-7 items-center justify-center rounded-full",
							config.iconBgClass,
						)}
					>
						<Icon className="size-4" />
					</div>
				</div>
				<p className={cn("mt-2 text-2xl font-bold", config.textClass)}>
					{count}
				</p>
				<p className={cn("mt-1 text-xs opacity-90", config.textClass)}>
					{config.description}
				</p>
			</CardContent>
		</Card>
	);
}
