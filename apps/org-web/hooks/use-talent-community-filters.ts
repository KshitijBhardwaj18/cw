import { CANDIDATE_WORKFORCE_TYPE_OPTIONS } from "@repo/shared";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { TalentCommunityQuery } from "@/services/talent-community.service";

const DEFAULT_PAGE_SIZE = 20;

export interface UseTalentCommunityFiltersOptions {
	pageSize?: number;
}

export function useTalentCommunityFilters(
	options?: UseTalentCommunityFiltersOptions,
) {
	const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "tcSearch", pageParamKey: "tcPage" },
	);

	const pageParam = Number(searchParams.get("tcPage") ?? "1");
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

	const workforceTypeFilter = searchParams.get("tcWfType") ?? "all";
	const statusFilter = searchParams.get("tcInvite") ?? "all";

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const setPage = useCallback(
		(p: number) => {
			pushParams({ tcPage: String(p) });
		},
		[pushParams],
	);

	const setWorkforceTypeFilter = useCallback(
		(v: string) => {
			const clear = !v || v === "all";
			pushParams({ tcWfType: clear ? null : v, tcPage: null });
		},
		[pushParams],
	);

	const setStatusFilter = useCallback(
		(v: string) => {
			const clear = !v || v === "all";
			pushParams({ tcInvite: clear ? null : v, tcPage: null });
		},
		[pushParams],
	);

	const query = useMemo<Omit<TalentCommunityQuery, "tab">>(
		() => ({
			search: searchFromUrl?.trim() || undefined,
			workforceType:
				workforceTypeFilter !== "all" ? workforceTypeFilter : undefined,
			inviteStatus: statusFilter !== "all" ? statusFilter : undefined,
			page,
			limit: pageSize,
		}),
		[searchFromUrl, workforceTypeFilter, statusFilter, page, pageSize],
	);

	const filterConfigs = useMemo(
		() => [
			{
				id: "talent-filter-workforce-type",
				label: "Workforce Type",
				value: workforceTypeFilter,
				onValueChange: setWorkforceTypeFilter,
				placeholder: "All",
				options: [
					{ value: "all", label: "All Types" },
					...CANDIDATE_WORKFORCE_TYPE_OPTIONS.map((o) => ({
						value: o.value,
						label: o.label,
					})),
				],
			},
			{
				id: "talent-filter-status",
				label: "Status",
				value: statusFilter,
				onValueChange: setStatusFilter,
				placeholder: "All",
				options: [
					{ value: "all", label: "All Status" },
					{ value: "PENDING", label: "Invite Pending" },
					{ value: "ACCEPTED", label: "Accepted" },
					{ value: "EXPIRED", label: "Expired" },
				],
			},
		],
		[
			setStatusFilter,
			setWorkforceTypeFilter,
			statusFilter,
			workforceTypeFilter,
		],
	);

	return {
		search: localSearch,
		debouncedSearch: searchFromUrl,
		setSearch: handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		pageSize,
		workforceTypeFilter,
		setWorkforceTypeFilter,
		statusFilter,
		setStatusFilter,
		query,
		resetPage: () => setPage(1),
		filterConfigs,
	};
}
