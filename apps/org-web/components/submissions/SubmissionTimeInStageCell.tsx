"use client";

import { useEffect, useState } from "react";
import {
	formatDaysInStage,
	formatTimeRemaining,
} from "@/utils/submission-format";

type SubmissionTimeInStageCellProps = {
	stageEnteredAt: string;
	agingDeadlineAt: string | null;
};

export function SubmissionTimeInStageCell({
	stageEnteredAt,
	agingDeadlineAt,
}: Readonly<SubmissionTimeInStageCellProps>) {
	const [lines, setLines] = useState<{
		inStage: string;
		remaining: string;
	} | null>(null);

	useEffect(() => {
		const tick = (): void => {
			setLines({
				inStage: formatDaysInStage(stageEnteredAt),
				remaining: formatTimeRemaining(agingDeadlineAt),
			});
		};
		tick();
		const id = setInterval(tick, 60_000);
		return () => clearInterval(id);
	}, [stageEnteredAt, agingDeadlineAt]);

	return (
		<>
			<p className="truncate text-sm">{lines?.inStage ?? "—"}</p>
			<p className="text-muted-foreground text-xs truncate">
				{lines?.remaining ?? "—"}
			</p>
		</>
	);
}
