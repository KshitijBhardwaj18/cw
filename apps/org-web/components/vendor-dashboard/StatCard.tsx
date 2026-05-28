"use client";

import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
} from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";
import { cn } from "@repo/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

const statIconVariants = cva(
	"flex size-10 items-center justify-center rounded",
	{
		variants: {
			variant: {
				default: "bg-primary/10 text-primary",
				blue: "bg-blue-100 text-blue-700",
				green: "bg-green-100 text-green-700",
				amber: "bg-amber-100 text-amber-800",
				violet: "bg-violet-100 text-violet-700",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

const progressBarVariants: Record<string, string> = {
	default: "[&>div]:bg-primary",
	blue: "[&>div]:bg-blue-600",
	green: "[&>div]:bg-green-600",
	amber: "[&>div]:bg-amber-600",
	violet: "[&>div]:bg-violet-600",
};

interface StatCardProps extends VariantProps<typeof statIconVariants> {
	title: string;
	value: string | number;
	icon: LucideIcon;
	trendIcon?: LucideIcon;
	description?: React.ReactNode;
	progress?: number;
	className?: string;
}

export function StatCard({
	title,
	value,
	icon: Icon,
	trendIcon: TrendIcon,
	description,
	progress,
	variant = "default",
	className,
}: Readonly<StatCardProps>) {
	const progressColor = progressBarVariants[variant || "default"];

	return (
		<Card className={cn("gap-2", className)}>
			<CardHeader>
				<div className={statIconVariants({ variant })}>
					<Icon className="h-5 w-5" />
				</div>
				{TrendIcon && (
					<CardAction>
						<TrendIcon className="h-4 w-4 text-green-600" />
					</CardAction>
				)}
			</CardHeader>
			<CardContent className="flex flex-col gap-1">
				<p className="text-sm font-medium text-muted-foreground">{title}</p>
				<h3 className="text-2xl font-bold tracking-tight">{value}</h3>
				{description && (
					<div className="mt-1 flex items-center text-xs font-medium">
						{description}
					</div>
				)}
				{progress !== undefined && (
					<div className="mt-4">
						<Progress value={progress} className={cn("h-1.5", progressColor)} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}
