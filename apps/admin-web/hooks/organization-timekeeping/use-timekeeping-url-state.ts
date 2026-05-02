"use client";

import type { DataSourceFilter } from "@repo/ui/general/timekeeping/types";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { ApprovalStatusFilter } from "@/types/timekeeping";

export function useTimekeepingUrlState() {
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "atkSearch", pageParamKey: null },
	);

	const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

	const dataSourceFilter: DataSourceFilter = useMemo(() => {
		const d = searchParams.get("ds");
		if (d === "FILE_UPLOAD" || d === "MOBILE_APP") return d;
		return "ALL";
	}, [searchParams]);

	const groupedStatusFilter: ApprovalStatusFilter = useMemo(() => {
		const g = searchParams.get("gs");
		if (
			g === "ALL" ||
			g === "PENDING" ||
			g === "APPROVED" ||
			g === "DISPUTED" ||
			g === "REJECTED"
		) {
			return g;
		}
		return "PENDING";
	}, [searchParams]);

	const setDataSourceFilter = useCallback(
		(v: DataSourceFilter) => {
			pushParams({ ds: v === "ALL" ? null : v });
		},
		[pushParams],
	);

	const setGroupedStatusFilter = useCallback(
		(v: ApprovalStatusFilter) => {
			pushParams({ gs: v === "PENDING" ? null : v });
		},
		[pushParams],
	);

	return {
		localSearch,
		searchFromUrl,
		handleSearchChange,
		isFiltersExpanded,
		setIsFiltersExpanded,
		dataSourceFilter,
		setDataSourceFilter,
		groupedStatusFilter,
		setGroupedStatusFilter,
	};
}

export type TimekeepingUrlState = ReturnType<typeof useTimekeepingUrlState>;
