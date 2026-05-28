"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const cardContentVariants = cva("transition-colors", {
	variants: {
		variant: {
			default: "text-foreground",
			primary: "text-primary",
			destructive: "text-destructive",
			info: "text-blue-600",
			success: "text-green-600",
			warning: "text-amber-600",
			error: "text-red-600",
			inactive: "text-gray-600",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export type MetricCardVariant = VariantProps<
	typeof cardContentVariants
>["variant"];

export interface MetricCardProps
	extends VariantProps<typeof cardContentVariants> {
	title: string;
	value: ReactNode;
	icon?: LucideIcon;
	subLabel?: ReactNode;
	className?: string;
}

export function MetricCard({
	title,
	value,
	icon: Icon,
	subLabel,
	variant,
	className,
}: Readonly<MetricCardProps>) {
	return (
		<Card className={cn("py-1", className)}>
			<CardContent className="p-4">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<p className="text-muted-foreground text-sm font-medium">{title}</p>
						<p
							className={cn(
								"mt-1 text-2xl font-semibold tabular-nums tracking-tight transition-colors",
								variant === "default"
									? "text-foreground"
									: cardContentVariants({ variant }),
							)}
						>
							{value}
						</p>
						{subLabel && (
							<p className="text-muted-foreground mt-1 text-xs">{subLabel}</p>
						)}
					</div>
					{Icon && (
						<Icon
							className={cn(
								"mt-0.5 size-4 shrink-0 transition-colors",
								cardContentVariants({ variant }),
							)}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
