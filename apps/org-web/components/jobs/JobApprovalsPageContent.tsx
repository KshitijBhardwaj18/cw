"use client";

import { Action, useAbility } from "@repo/casl";
import { Card, CardHeader } from "@repo/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { cn } from "@repo/ui/lib/utils";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { FileText } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { AccessBlockedState } from "@/components/general/AccessBlockedState";
import {
	useApproveRequisition,
	usePendingRequisitionApprovals,
	useRejectRequisition,
} from "@/queries/requisitions.queries";
import { PendingApprovalCard } from "./PendingApprovalCard";

const APPROVAL_PARAMS = {
	PAGE: "jaPage",
	LIMIT: "jaLimit",
	SEARCH: "jaSearch",
} as const;

export function JobApprovalsPageContent() {
	const ability = useAbility();
	const canReadApprovals = ability.can(Action.Read, "RequisitionApprovals");
	const canUpdateApprovals = ability.can(Action.Update, "RequisitionApprovals");
	const { page, setPage, limit, setLimit } = usePaginationControls({
		pageParamKey: APPROVAL_PARAMS.PAGE,
		limitParamKey: APPROVAL_PARAMS.LIMIT,
		defaultLimit: 20,
	});

	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			wait: 350,
			paramKey: APPROVAL_PARAMS.SEARCH,
			pageParamKey: APPROVAL_PARAMS.PAGE,
		},
	);

	const query = useMemo(
		() => ({
			page,
			limit,
			search: searchFromUrl.trim() || undefined,
		}),
		[page, limit, searchFromUrl],
	);
	const pendingQuery = usePendingRequisitionApprovals(query, {
		enabled: canReadApprovals,
	});
	const approveMutation = useApproveRequisition();
	const rejectMutation = useRejectRequisition();
	const pending = pendingQuery.data?.data ?? [];
	const count = pendingQuery.data?.total ?? 0;
	const pageCount = pendingQuery.data?.totalPages ?? 1;

	const handleApprove = (id: string) => {
		approveMutation.mutate(
			{ requisitionId: id },
			{
				onSuccess: () => toast.success("Job approved"),
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to approve job",
					),
			},
		);
	};

	const handleReject = (id: string) => {
		rejectMutation.mutate(
			{ requisitionId: id },
			{
				onSuccess: () => toast.success("Job rejected"),
				onError: (err) =>
					toast.error(
						err instanceof Error ? err.message : "Failed to reject job",
					),
			},
		);
	};

	if (!canReadApprovals) {
		return (
			<div className="space-y-6">
				<ConfigPageHeader
					title="Job Approvals"
					total={0}
					itemLabel="approval"
					itemLabelPlural="approvals"
				/>
				<AccessBlockedState
					description="You do not have permission to view job approvals for this organization."
					backHref="/org/jobs"
					backLabel="Back to Jobs"
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Job Approvals"
				total={count}
				itemLabel="approval"
				itemLabelPlural="approvals"
				description="Review and approve pending job requisitions"
				backLink={{ href: "/org/jobs", label: "Back to Jobs" }}
			/>

			<Card>
				<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
					<div>
						<p className="text-muted-foreground text-sm font-medium">
							Jobs Pending Approval
						</p>
						<p
							className={cn(
								"mt-2 font-bold tabular-nums",
								"text-3xl tracking-tight",
							)}
						>
							{count}
						</p>
					</div>
					<div
						className="flex size-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
						aria-hidden
					>
						<FileText className="size-5" />
					</div>
				</CardHeader>
			</Card>

			<SearchWithFilters
				searchPlaceholder="Search pending approvals..."
				searchValue={localSearch}
				onSearchChange={handleSearchChange}
				filtersExpanded={false}
				onFiltersExpandedChange={() => {}}
				filterConfigs={[]}
			/>

			<div className="space-y-4">
				{pending.length === 0 ? (
					<Empty className="h-[300px]">
						<EmptyMedia variant="icon">
							<FileText />
						</EmptyMedia>
						<EmptyHeader>
							<EmptyTitle>No pending approvals</EmptyTitle>
							<EmptyDescription>
								No requisitions are waiting for your approval role.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					pending.map((job) => (
						<PendingApprovalCard
							key={job.id}
							job={job}
							canActOnApprovals={canUpdateApprovals}
							isApproving={approveMutation.isPending}
							isRejecting={rejectMutation.isPending}
							onApprove={handleApprove}
							onReject={handleReject}
						/>
					))
				)}
			</div>

			<PaginationControls
				currentPage={page}
				pageCount={pageCount}
				goToPage={setPage}
				limit={limit}
				setLimit={setLimit}
				pageSizeOptions={[10, 20, 50]}
			/>
		</div>
	);
}
