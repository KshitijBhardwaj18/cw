import { parseAsInteger, parseAsNumberLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";

export interface UsePaginationControlsOptions {
	pageParamKey?: string;
	limitParamKey?: string;
	defaultLimit?: number;
	defaultPage?: number;
	totalItems?: number;
	pageSizeOptions?: number[];
}

function pageLimitParser(defaultLimit: number, pageSizeOptions: number[]) {
	const safeDefault = defaultLimit > 0 ? defaultLimit : 10;
	if (pageSizeOptions.length === 0)
		return parseAsInteger.withDefault(safeDefault);
	const fallback = pageSizeOptions.includes(safeDefault)
		? safeDefault
		: (pageSizeOptions[0] ?? safeDefault);
	return parseAsNumberLiteral(pageSizeOptions).withDefault(fallback);
}

export const usePaginationControls = ({
	pageParamKey = "page",
	limitParamKey = "limit",
	defaultLimit = 10,
	defaultPage = 1,
	totalItems,
	pageSizeOptions = [],
}: UsePaginationControlsOptions) => {
	const [page, setPage] = useQueryState(
		pageParamKey,
		parseAsInteger.withDefault(defaultPage),
	);
	const [limit, setLimit] = useQueryState(
		limitParamKey,
		pageLimitParser(defaultLimit, pageSizeOptions),
	);

	const handleSetLimit = (newLimit: number) => {
		if (newLimit === limit) return;
		setLimit(newLimit);
		setPage(1);
	};

	const safeLimit = useMemo(() => Math.max(1, limit), [limit]);

	const safePage = useMemo(() => {
		if (totalItems === undefined || totalItems === null)
			return Math.max(page, 1);
		if (totalItems <= 0) return 1;
		const maxPage = Math.ceil(totalItems / safeLimit);
		return Math.min(Math.max(1, page), maxPage);
	}, [page, totalItems, safeLimit]);

	const handleResetPage = () => {
		setPage(1);
	};

	return {
		page: safePage,
		limit: safeLimit,
		setPage,
		setLimit: handleSetLimit,
		resetPage: handleResetPage,
	};
};
