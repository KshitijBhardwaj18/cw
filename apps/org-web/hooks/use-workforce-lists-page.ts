"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
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

export function useWorkforceListsPage() {
	const { id: orgId } = useOrgContext();
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "wlSearch", pageParamKey: "wlPage" },
	);

	const pageParam = Number(searchParams.get("wlPage") ?? "1");
	const currentPage =
		Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [listToDelete, setListToDelete] = useState<WorkforceListDetail | null>(
		null,
	);

	const setCurrentPage = useCallback(
		(p: number) => {
			pushParams({ wlPage: String(p) });
		},
		[pushParams],
	);

	const listQuery = useWorkforceLists(orgId, {
		search: searchFromUrl.trim() || undefined,
		page: currentPage,
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
				pushParams({ page: null });
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
					if (paginatedLists.length === 1 && currentPage > 1) {
						pushParams({ page: String(currentPage - 1) });
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
		currentPage,
		setCurrentPage,
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
