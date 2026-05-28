"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import {
	useCreateWorkforceList,
	useDeleteWorkforceList,
	useWorkforceLists,
} from "@/queries/workforce-lists.queries";
import type { CreateWorkforceListFormValues } from "@/schemas/workforce-lists.schema";
import type { WorkforceListDetail } from "@/types/workforce-list";

const DEFAULT_LIMIT = 6;
const PAGE_SIZE_OPTIONS = [6, 12, 18, 24];

export const WORKFORCE_LISTS_PARAMS = {
	PAGE: "wlPage",
	LIMIT: "wlLimit",
	SEARCH: "wlSearch",
} as const;

export function useWorkforceListsPage() {
	const { fmtShortDate } = useUserTimezone();

	const { page, limit, setPage, setLimit } = usePaginationControls({
		pageParamKey: WORKFORCE_LISTS_PARAMS.PAGE,
		limitParamKey: WORKFORCE_LISTS_PARAMS.LIMIT,
		defaultLimit: DEFAULT_LIMIT,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});

	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			paramKey: WORKFORCE_LISTS_PARAMS.SEARCH,
			pageParamKey: WORKFORCE_LISTS_PARAMS.PAGE,
		},
	);

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [listToDelete, setListToDelete] = useState<WorkforceListDetail | null>(
		null,
	);

	const listQuery = useWorkforceLists({
		search: searchFromUrl.trim() || undefined,
		page,
		limit,
	});
	const createMutation = useCreateWorkforceList();
	const deleteMutation = useDeleteWorkforceList();

	const filteredLists = useMemo(() => {
		const rows = listQuery.data?.data ?? [];
		return rows.map((l) => ({
			...l,
			members: [],
			updatedAt: fmtShortDate(l.updatedAt),
		}));
	}, [listQuery.data, fmtShortDate]);

	const totalPages = listQuery.data?.totalPages ?? 1;
	const totalCount = listQuery.data?.total ?? 0;
	const paginatedLists = filteredLists;

	const handleCreateList = (values: CreateWorkforceListFormValues) => {
		createMutation.mutate(values, {
			onSuccess: () => {
				toast.success("Workforce list created");
				setCreateDialogOpen(false);
				setPage(1);
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Something went wrong",
				);
			},
		});
	};

	const handleConfirmDelete = () => {
		if (listToDelete) {
			deleteMutation.mutate(listToDelete.id, {
				onSuccess: () => {
					toast.success("Workforce list deleted");
					setDeleteDialogOpen(false);
					setListToDelete(null);
					if (paginatedLists.length === 1 && page > 1) {
						setPage(page - 1);
					}
				},
				onError: (err) => {
					toast.error(
						err instanceof Error ? err.message : "Something went wrong",
					);
				},
			});
		}
	};

	const handleDeletePrompt = (list: WorkforceListDetail) => {
		setListToDelete(list);
		setDeleteDialogOpen(true);
	};

	return {
		createDialogOpen,
		setCreateDialogOpen,
		isLoading: listQuery.isLoading,
		filteredLists,
		paginatedLists,
		totalCount,
		currentPage: page,
		setCurrentPage: setPage,
		limit,
		setLimit,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
		totalPages,
		search: localSearch,
		setSearch: handleSearchChange,
		deleteDialogOpen,
		setDeleteDialogOpen,
		listToDelete,
		setListToDelete,
		handleCreateList,
		handleConfirmDelete,
		handleDeletePrompt,
		isDeletePending: deleteMutation.isPending,
	};
}
