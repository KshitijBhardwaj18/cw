"use client";

import { cn } from "@repo/ui/lib/utils";

export interface ActivityItemProps {
	title: string;
	description: string;
	time: string;
	dotColor: string;
}

export function ActivityItem({
	title,
	description,
	time,
	dotColor,
}: Readonly<ActivityItemProps>) {
	return (
		<div className="group relative flex gap-4 py-2.5 border-b border-border/50 last:pb-0 last:border-b-0">
			<div className="relative shrink-0 mt-1">
				<div className={cn("size-2 rounded-full", dotColor)} />
			</div>
			<div className="flex flex-col gap-1">
				<h4 className="text-sm font-semibold text-foreground">{title}</h4>
				<p className="text-sm text-muted-foreground">{description}</p>
				<span className="text-muted-foreground text-xs">{time}</span>
			</div>
		</div>
	);
}
