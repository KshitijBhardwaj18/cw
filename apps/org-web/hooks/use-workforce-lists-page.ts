"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrgContext } from "@/contexts/org-context";
import {
	useCreateWorkforceList,
	useDeleteWorkforceList,
	useWorkforceLists,
} from "@/queries/workforce-lists.queries";
import type { CreateWorkforceListFormValues } from "@/schemas/workforce-lists.schema";
import type { WorkforceListDetail } from "@/types/workforce-list";

function getCurrentDateLabel() {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date());
}

function formatDateLabel(input: string | Date) {
	const d = typeof input === "string" ? new Date(input) : input;
	if (Number.isNaN(d.getTime())) return getCurrentDateLabel();
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(d);
}

const PAGE_SIZE = 6;

export const WORKFORCE_LISTS_PARAMS = {
	PAGE: "wlPage",
	SEARCH: "wlSearch",
} as const;

export function useWorkforceListsPage() {
	const { id: orgId } = useOrgContext();

	const { page, setPage } = usePaginationControls({
		pageParamKey: WORKFORCE_LISTS_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
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

	const listQuery = useWorkforceLists(orgId, {
		search: searchFromUrl.trim() || undefined,
		page,
		limit: PAGE_SIZE,
	});
	const createMutation = useCreateWorkforceList(orgId);
	const deleteMutation = useDeleteWorkforceList(orgId);

	const filteredLists = useMemo(() => {
		const rows = listQuery.data?.data ?? [];
		return rows.map((l) => ({
			...l,
			members: [],
			updatedAt: formatDateLabel(l.updatedAt),
		}));
	}, [listQuery.data]);

	const totalPages = listQuery.data?.totalPages ?? 1;
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
		currentPage: page,
		setCurrentPage: setPage,
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
