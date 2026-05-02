"use client";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { cn } from "@repo/ui/lib/utils";
import { SubmissionStageTabIcon } from "@/components/submissions/SubmissionStageTabIcon";
import type {
	SUBMISSION_STAGE_TABS,
	SubmissionStageKey,
} from "@/constants/submissions";

export type JobCandidateSubmissionsTabItem =
	(typeof SUBMISSION_STAGE_TABS)[number];

export interface JobCandidateSubmissionsStageTabsProps {
	activeStage: SubmissionStageKey;
	visibleTabs: readonly JobCandidateSubmissionsTabItem[];
	stageCounts: Record<SubmissionStageKey, number>;
	onStageChange: (stage: SubmissionStageKey) => void;
}

export function JobCandidateSubmissionsStageTabs({
	activeStage,
	visibleTabs,
	stageCounts,
	onStageChange,
}: JobCandidateSubmissionsStageTabsProps) {
	return (
		<Tabs
			value={activeStage}
			onValueChange={(v) => onStageChange(v as SubmissionStageKey)}
		>
			<ScrollableLineTabsRow>
				<TabsList
					variant="list"
					className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
				>
					{visibleTabs.map(({ stage, label, icon }) => (
						<TabsTrigger
							key={stage}
							value={stage}
							className="shrink-0 gap-2 rounded-none border-0 px-3 py-3 sm:px-4"
							type="button"
						>
							<SubmissionStageTabIcon
								kind={icon}
								className={activeStage === stage ? "text-primary" : undefined}
							/>
							<span className="hidden sm:inline">{label}</span>
							<span
								className={cn(
									"rounded-full px-1.5 py-0.5 text-xs font-semibold",
									activeStage === stage
										? "bg-primary/10 text-primary"
										: "bg-muted text-muted-foreground",
								)}
							>
								{stageCounts[stage] ?? 0}
							</span>
						</TabsTrigger>
					))}
				</TabsList>
			</ScrollableLineTabsRow>
		</Tabs>
	);
}
