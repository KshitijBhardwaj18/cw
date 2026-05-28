"use client";

import { Badge } from "@repo/ui/components/badge";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { Star } from "lucide-react";

interface PriorityFactorsCardProps {
	tags: string[];
	variant?: "card" | "inline";
	className?: string;
}

export function PriorityFactorsCard({
	tags,
	variant = "card",
	className,
}: Readonly<PriorityFactorsCardProps>) {
	if (tags.length === 0) return null;

	const badges = (
		<div className="flex flex-wrap gap-2">
			{tags.map((tag) => (
				<Badge
					key={tag}
					variant="secondary"
					className="border-sky-200 bg-sky-50 px-3 py-1 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100"
				>
					{tag}
				</Badge>
			))}
		</div>
	);

	if (variant === "inline") {
		return (
			<div className={cn("space-y-3", className)}>
				<div className="flex items-center gap-2">
					<Star className="text-primary size-4" />
					<h5 className="font-bold text-foreground text-base">
						Priority factors
					</h5>
				</div>
				{badges}
			</div>
		);
	}

	return (
		<Card className={className}>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Star className="text-primary size-4" />
					<CardTitle className="text-base">Priority factors</CardTitle>
				</div>
			</CardHeader>
			<CardContent>{badges}</CardContent>
		</Card>
	);
}
