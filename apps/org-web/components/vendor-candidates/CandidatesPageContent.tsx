"use client";

import { Action, useAbility } from "@repo/casl";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { CustomTable } from "@repo/ui/general/CustomTable";
import PaginationControls from "@repo/ui/general/PaginationControls";
import { SearchWithFilters } from "@repo/ui/shared/SearchWithFilters";
import { UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useOptionalOrgContext } from "@/contexts/org-context";
import { useVendorCandidates } from "@/hooks/vendor/use-vendor-candidates";
import { CandidatesMetricCards } from "./CandidatesMetricCards";
import { QuickOnboardCandidateDialog } from "./QuickOnboardCandidateDialog";

export function CandidatesPageContent() {
	const org = useOptionalOrgContext();
	const ability = useAbility();
	const canCreateCandidates = ability.can(Action.Create, "Candidate");
	const [quickOnboardOpen, setQuickOnboardOpen] = useState(false);

	const {
		columns,
		metrics,
		isMetricsLoading,
		rows,
		totalRows,
		pageCount,
		page,
		setPage,
		search,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
		filterConfigs,
		limit,
		setLimit,
		pageSizeOptions,
		isListLoading,
		isListError,
	} = useVendorCandidates();

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="My Candidates"
				total={totalRows}
				itemLabel="candidate"
				itemLabelPlural="candidates"
				description="Manage your candidate pool and compliance documents"
				actions={
					canCreateCandidates
						? [
								{
									key: "quick-onboard",
									label: "Quick Onboard",
									icon: <UserPlus className="size-4" />,
									onClick: () => {
										if (!org?.slug) {
											toast.error(
												"Organization context is required to invite a candidate.",
											);
											return;
										}
										setQuickOnboardOpen(true);
									},
								},
							]
						: []
				}
			/>

			{org?.slug ? (
				<QuickOnboardCandidateDialog
					open={quickOnboardOpen}
					onOpenChange={setQuickOnboardOpen}
				/>
			) : null}

			{isMetricsLoading || !metrics ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-28 w-full rounded-lg" />
					))}
				</div>
			) : (
				<CandidatesMetricCards stats={metrics} />
			)}

			<SearchWithFilters
				searchPlaceholder="Search by name, email, or specialty..."
				searchValue={search}
				onSearchChange={setSearch}
				filtersExpanded={filtersExpanded}
				onFiltersExpandedChange={setFiltersExpanded}
				filterConfigs={filterConfigs}
			/>

			{isListError ? (
				<Empty className="border-muted/50 py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Users className="size-5" />
						</EmptyMedia>
						<EmptyTitle>Could not load candidates</EmptyTitle>
						<EmptyDescription>Try again or contact support.</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : isListLoading ? (
				<div className="space-y-3">
					<Skeleton className="h-48 w-full rounded-lg" />
				</div>
			) : totalRows === 0 ? (
				<Empty className="border-muted/50 py-12">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Users className="size-5" />
						</EmptyMedia>
						<EmptyTitle>No candidates in this view</EmptyTitle>
						<EmptyDescription>
							Try clearing search or changing the status filter.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<>
					<CustomTable
						data={rows}
						columns={columns}
						enableSorting
						enablePagination={false}
						emptyState={null}
					/>
					<PaginationControls
						currentPage={page}
						pageCount={pageCount}
						goToPage={setPage}
						limit={limit}
						setLimit={setLimit}
						pageSizeOptions={pageSizeOptions}
						totalItems={totalRows}
						itemLabel="candidate"
						itemLabelPlural="candidates"
					/>
				</>
			)}
		</div>
	);
}

export default CandidatesPageContent;
