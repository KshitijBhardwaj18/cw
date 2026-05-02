import type { CandidateWorkforceType } from "@repo/shared";
import { useLocalDebouncedSearch } from "@repo/ui/hooks/use-local-debounced-search";
import { useCallback, useMemo, useState } from "react";
import type { WorkforceListMembersQuery } from "@/services/workforce-lists.service";

const SEARCH_DEBOUNCE_MS = 300;
export const ADD_MEMBERS_AVAILABLE_DEFAULT_PAGE_SIZE = 20;

export interface UseAddMembersToListFiltersOptions {
	debounceMs?: number;
	defaultPageSize?: number;
}

export function useAddMembersToListFilters(
	options?: UseAddMembersToListFiltersOptions,
) {
	const debounceMs = options?.debounceMs ?? SEARCH_DEBOUNCE_MS;
	const defaultPageSize =
		options?.defaultPageSize ?? ADD_MEMBERS_AVAILABLE_DEFAULT_PAGE_SIZE;

	const {
		search,
		debouncedSearch,
		setSearch: setSearchBase,
	} = useLocalDebouncedSearch("", { wait: debounceMs });

	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(defaultPageSize);
	const [workforceType, setWorkforceTypeState] = useState("all");

	const setSearch = useCallback(
		(v: string) => {
			setSearchBase(v);
			setPage(1);
		},
		[setSearchBase],
	);

	const setWorkforceType = useCallback((v: string) => {
		setWorkforceTypeState(v);
		setPage(1);
	}, []);

	const reset = useCallback(() => {
		setSearchBase("");
		setWorkforceTypeState("all");
		setFiltersExpanded(false);
		setPage(1);
		setPageSize(defaultPageSize);
	}, [defaultPageSize, setSearchBase]);

	const query = useMemo<WorkforceListMembersQuery>(
		() => ({
			search: debouncedSearch?.trim() || undefined,
			workforceType:
				workforceType !== "all"
					? (workforceType as CandidateWorkforceType)
					: undefined,
			page,
			limit: pageSize,
		}),
		[debouncedSearch, workforceType, page, pageSize],
	);

	return {
		search,
		debouncedSearch,
		setSearch,
		filtersExpanded,
		setFiltersExpanded,
		page,
		setPage,
		pageSize,
		setPageSize,
		workforceType,
		setWorkforceType,
		query,
		reset,
	};
}
