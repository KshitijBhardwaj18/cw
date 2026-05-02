"use client";

import { Button } from "@repo/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { TINTED_METRIC_TONE_STYLES } from "@repo/ui/general/TintedMetricCard";
import { cn } from "@repo/ui/lib/utils";
import { ArrowRight } from "lucide-react";

export interface TimecardCurrentAssignmentCardProps {
	assignmentTitle: string;
	currentWeekEnding: string;
	onEnterTime: () => void;
}

export function TimecardCurrentAssignmentCard({
	assignmentTitle,
	currentWeekEnding,
	onEnterTime,
}: TimecardCurrentAssignmentCardProps) {
	const sky = TINTED_METRIC_TONE_STYLES.sky;

	return (
		<Card className={cn("rounded-xl border py-6 shadow-sm", sky.card)}>
			<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1.5">
					<CardTitle className={cn("text-xl", sky.title)}>
						Current Assignment
					</CardTitle>
					<CardDescription className={cn("text-base font-normal", sky.value)}>
						{assignmentTitle}
					</CardDescription>
					<p className={cn("text-sm", sky.title)}>
						Week Ending: {currentWeekEnding}
					</p>
				</div>
				<Button type="button" size="sm" onClick={onEnterTime}>
					Enter Time
					<ArrowRight className="size-4" aria-hidden />
				</Button>
			</CardHeader>
		</Card>
	);
}
