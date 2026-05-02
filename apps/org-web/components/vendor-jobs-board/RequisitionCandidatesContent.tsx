"use client";

import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { ScrollableLineTabsRow } from "@repo/ui/general/ScrollableLineTabsRow";
import { Send, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useVendorRequisitionCandidates } from "@/queries/vendor-requisitions.queries";
import type { VendorRequisitionCandidatesTab } from "@/services/vendor-requisitions.service";
import type { Candidate } from "@/types/vendor-jobs-board";
import { mapCandidateRowToCandidate } from "@/utils/vendor-job-board-mapper";
import { CandidateListItem } from "./CandidateListItem";

const PAGE_SIZE = 10;

interface RequisitionCandidatesContentProps {
	requisitionId: string;
	enabled?: boolean;
	showSubmittedTab?: boolean;
	onViewCandidate: (candidate: Candidate) => void;
}

export function RequisitionCandidatesContent({
	requisitionId,
	enabled = true,
	showSubmittedTab = true,
	onViewCandidate,
}: RequisitionCandidatesContentProps) {
	const [activeTab, setActiveTab] =
		useState<VendorRequisitionCandidatesTab>("interested");
	const [page, setPage] = useState(1);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset paging when tab or job changes
	useEffect(() => {
		setPage(1);
	}, [activeTab, requisitionId]);

	useEffect(() => {
		if (!showSubmittedTab && activeTab === "submitted") {
			setActiveTab("interested");
		}
	}, [showSubmittedTab, activeTab]);

	const interestedCount = useVendorRequisitionCandidates(
		requisitionId,
		{ tab: "interested", page: 1, limit: 1 },
		{ enabled: enabled && !!requisitionId },
	);
	const matchedCount = useVendorRequisitionCandidates(
		requisitionId,
		{ tab: "matched", page: 1, limit: 1 },
		{ enabled: enabled && !!requisitionId },
	);
	const submittedCount = useVendorRequisitionCandidates(
		requisitionId,
		{ tab: "submitted", page: 1, limit: 1 },
		{ enabled: enabled && !!requisitionId && showSubmittedTab },
	);

	const listQuery = useVendorRequisitionCandidates(
		requisitionId,
		{ tab: activeTab, page, limit: PAGE_SIZE },
		{ enabled: enabled && !!requisitionId },
	);

	const tabs: {
		id: VendorRequisitionCandidatesTab;
		label: string;
		count: number;
		icon: typeof Users;
	}[] = [
		{
			id: "interested",
			label: "Interested",
			count: interestedCount.data?.total ?? 0,
			icon: Users,
		},
		{
			id: "matched",
			label: "Matched",
			count: matchedCount.data?.total ?? 0,
			icon: Sparkles,
		},
		...(showSubmittedTab
			? [
					{
						id: "submitted" as const,
						label: "Submitted",
						count: submittedCount.data?.total ?? 0,
						icon: Send,
					},
				]
			: []),
	];

	const pageCount = listQuery.data?.totalPages ?? 1;
	const rows = listQuery.data?.data ?? [];

	return (
		<div className="px-6 pb-2">
			<Tabs
				value={activeTab}
				onValueChange={(v) => setActiveTab(v as VendorRequisitionCandidatesTab)}
				className="flex-col"
			>
				<ScrollableLineTabsRow>
					<TabsList
						variant="line"
						className="inline-flex h-10 w-max min-w-full flex-nowrap items-stretch justify-start gap-0 rounded-none border-0 bg-transparent p-0"
					>
						{tabs.map((tab) => (
							<TabsTrigger
								key={tab.id}
								value={tab.id}
								className="flex-none gap-2 px-4"
							>
								<tab.icon className="size-3.5" />
								{tab.label}
								<Badge
									variant={activeTab === tab.id ? "default" : "inactive"}
									className="size-5 rounded-full flex items-center justify-center p-0 text-xs"
								>
									{tab.count}
								</Badge>
							</TabsTrigger>
						))}
					</TabsList>
				</ScrollableLineTabsRow>

				<div className="mt-4 space-y-4">
					{listQuery.isLoading && (
						<div className="space-y-3">
							<Skeleton className="h-24 w-full" />
							<Skeleton className="h-24 w-full" />
						</div>
					)}

					{listQuery.isError && (
						<p className="text-destructive text-sm py-4 text-center">
							{listQuery.error instanceof Error
								? listQuery.error.message
								: "Could not load candidates."}
						</p>
					)}

					{!listQuery.isLoading && !listQuery.isError && rows.length === 0 && (
						<div className="py-4 text-center">
							<p className="text-muted-foreground text-sm">
								No candidates in this tab.
							</p>
						</div>
					)}

					{!listQuery.isLoading &&
						!listQuery.isError &&
						rows.length > 0 &&
						rows.map((row) => (
							<CandidateListItem
								key={row.id}
								candidate={mapCandidateRowToCandidate(row)}
								onClick={() => onViewCandidate(mapCandidateRowToCandidate(row))}
							/>
						))}

					{pageCount > 1 && (
						<PaginationControls
							currentPage={page}
							pageCount={pageCount}
							goToPage={setPage}
							limit={PAGE_SIZE}
							setLimit={() => {}}
							pageSizeOptions={[PAGE_SIZE]}
						/>
					)}
				</div>
			</Tabs>
		</div>
	);
}
