"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { ClipboardList } from "lucide-react";
import {
	GRIEVANCE_STAT_CARDS,
	type GrievanceSummaryFilterKey,
} from "@/constants/grievances";
import type { GrievanceSummaryCounts } from "@/hooks/use-grievances-page";

export interface GrievanceSummaryStatCardsProps {
	counts: GrievanceSummaryCounts;
	activeKey: GrievanceSummaryFilterKey;
	onFilterChange: (key: GrievanceSummaryFilterKey) => void;
}

export function GrievanceSummaryStatCards({
	counts,
	activeKey,
	onFilterChange,
}: GrievanceSummaryStatCardsProps) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{GRIEVANCE_STAT_CARDS.map((card) => {
				const count =
					card.key === "ALL"
						? counts.total
						: card.key === "OPEN"
							? counts.open
							: card.key === "IN_PROGRESS"
								? counts.inProgress
								: counts.resolved;
				const isActive = activeKey === card.key;
				return (
					<button
						key={card.key}
						type="button"
						onClick={() => onFilterChange(card.key)}
						className="text-left"
					>
						<Card
							className={cn(
								"cursor-pointer py-1 transition-all hover:shadow-sm",
								isActive ? card.activeClass : "hover:border-border/80",
							)}
						>
							<CardContent className="relative p-4">
								<div className="flex items-start justify-between gap-2">
									<p className="text-muted-foreground text-xs font-medium">
										{card.label}
									</p>
									{card.key === "ALL" ? (
										<ClipboardList className="text-muted-foreground size-4 shrink-0" />
									) : null}
								</div>
								<p className={cn("mt-1 text-2xl font-bold", card.countClass)}>
									{count}
								</p>
								<p className="text-muted-foreground mt-1 text-xs">
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
