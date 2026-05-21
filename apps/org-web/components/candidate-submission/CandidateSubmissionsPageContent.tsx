"use client";

import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/tabs";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import {
	SUBMISSION_TABS,
	type SubmissionTabValue,
} from "@/constants/candidate/submissions";
import { useCandidateSubmissionsPage } from "@/hooks/candidate/use-candidate-submissions-page";
import type { CandidateSubmissionTabStats } from "@/types/candidate-submission";
import { SubmissionsListContent } from "./SubmissionsListContent";

function tabCount(
	stats: CandidateSubmissionTabStats | undefined,
	tab: SubmissionTabValue,
): number {
	if (!stats) return 0;
	return stats[tab];
}

export default function CandidateSubmissionsPageContent() {
	const {
		organizationId,
		tabStats,
		isLoading,
		activeTab,
		setActiveTab,
		listQuery,
		page,
		setPage,
		limit,
		setLimit,
		portalCopy,
		withdrawMutation,
		acceptMutation,
	} = useCandidateSubmissionsPage();

	if (isLoading) {
		return (
			<div className="w-full space-y-6">
				<Skeleton className="h-10 w-full max-w-md" />
				<Skeleton className="h-48 w-full rounded-lg" />
			</div>
		);
	}

	if (!organizationId) {
		return (
			<div className="py-12 text-center text-muted-foreground text-sm">
				Complete onboarding with an organization to view your applications.
			</div>
		);
	}

	return (
		<div className="w-full space-y-6">
			<Tabs
				value={activeTab}
				onValueChange={(v) => setActiveTab(v as SubmissionTabValue)}
				className="w-full flex-col space-y-6"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-auto w-max min-w-full flex-nowrap justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						{SUBMISSION_TABS.map((tab) => {
							const count = tabCount(tabStats, tab.value);

							return (
								<TabsTrigger
									key={tab.value}
									value={tab.value}
									className="group inline-flex flex-none items-center gap-1.5 px-2 text-sm sm:gap-2 sm:px-3"
								>
									<tab.icon className="size-4" />
									{tab.label}
									<Badge
										variant={activeTab === tab.value ? "default" : "inactive"}
										className="flex size-5 items-center justify-center rounded-full p-0"
									>
										{count}
									</Badge>
								</TabsTrigger>
							);
						})}
					</TabsList>
				</ScrollableLineTabsRow>

				{SUBMISSION_TABS.map((tab) => (
					<TabsContent key={tab.value} value={tab.value}>
						{activeTab === tab.value ? (
							<SubmissionsListContent
								listQuery={listQuery}
								page={page}
								setPage={setPage}
								limit={limit}
								setLimit={setLimit}
								portalCopy={portalCopy}
								withdrawMutation={withdrawMutation}
								acceptMutation={acceptMutation}
							/>
						) : null}
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
