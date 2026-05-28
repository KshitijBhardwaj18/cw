"use client";

import { Clock } from "lucide-react";
import type { SubmissionListRow } from "@/constants/submissions";

export function SubmissionSlaStatusCell({
	row,
}: Readonly<{ row: SubmissionListRow }>) {
	const { slaLabel } = row;
	if (slaLabel === "ON_TIME") {
		return (
			<div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
				<Clock className="size-3.5 shrink-0" />
				<span className="text-xs font-semibold tracking-wide text-nowrap">
					ON TIME
				</span>
			</div>
		);
	}
	if (slaLabel === "OVERDUE") {
		return (
			<div className="flex items-center gap-1.5 text-destructive">
				<Clock className="size-3.5 shrink-0" />
				<span className="text-xs font-semibold tracking-wide text-nowrap">
					OVERDUE
				</span>
			</div>
		);
	}
	return (
		<div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
			<Clock className="size-3.5 shrink-0" />
			<span className="text-xs font-semibold tracking-wide text-nowrap">
				NEAR
			</span>
		</div>
	);
}
