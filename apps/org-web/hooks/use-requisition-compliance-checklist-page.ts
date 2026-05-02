"use client";

import { useConfigPageSearch } from "@repo/ui/hooks/use-config-page-search";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrgContext } from "@/contexts/org-context";
import {
	useComplianceChecklistsSuspense,
	useCreateChecklist,
	useDeleteChecklist,
	useDuplicateChecklist,
	useUpdateChecklist,
} from "@/queries/compliance-checklist.queries";

const CARDS_PER_PAGE = 6;
const PAGE_SIZE_OPTIONS = [6, 12, 18, 24];

export function useRequisitionComplianceChecklistPage() {
	const { id: orgId } = useOrgContext();
	const router = useRouter();
	const pathname = usePathname();
	const {
		page,
		localSearch,
		searchFromUrl,
		hasActiveSearch,
		handleSearchChange,
		buildSearchParams,
	} = useConfigPageSearch();

	const hasSearch = hasActiveSearch;

	const [createOpen, setCreateOpen] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [viewId, setViewId] = useState<string | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [limit, setLimitState] = useState(CARDS_PER_PAGE);

	const { data } = useComplianceChecklistsSuspense(orgId, {
		search: hasActiveSearch ? searchFromUrl : undefined,
		page,
		limit,
	});

	const checklists = data.data;
	const totalCount = data.total;
	const pageCount = data.totalPages ?? 1;

	const checklistToDelete = deleteId
		? checklists.find((c) => c.id === deleteId)
		: null;

	const createMutation = useCreateChecklist(orgId);
	const updateMutation = useUpdateChecklist(orgId, editId ?? "");
	const deleteMutation = useDeleteChecklist(orgId);
	const duplicateMutation = useDuplicateChecklist(orgId);

	const goToPage = useCallback(
		(p: number) => {
			router.push(`${pathname}${buildSearchParams({ page: p })}`, {
				scroll: false,
			});
		},
		[pathname, buildSearchParams, router],
	);

	const setLimit = useCallback(
		(l: number) => {
			setLimitState(l);
			router.push(`${pathname}${buildSearchParams({ page: 1 })}`, {
				scroll: false,
			});
		},
		[pathname, buildSearchParams, router],
	);

	const handleCreateSubmit = (payload: {
		templateName: string;
		description?: string;
		complianceItemIds: string[];
	}) => {
		const input = {
			name: payload.templateName,
			description: payload.description,
			complianceListItemIds: payload.complianceItemIds,
		};
		const onError = (err: unknown) => {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		};
		if (editId) {
			updateMutation.mutate(input, {
				onSuccess: () => {
					toast.success("Checklist template updated");
					setCreateOpen(false);
					setEditId(null);
				},
				onError,
			});
		} else {
			createMutation.mutate(input, {
				onSuccess: () => {
					toast.success("Checklist template created");
					setCreateOpen(false);
					setEditId(null);
				},
				onError,
			});
		}
	};

	const handleDeleteConfirm = () => {
		if (!deleteId) return;
		deleteMutation.mutate(deleteId, {
			onSuccess: () => {
				setDeleteId(null);
				toast.success("Checklist template deleted");
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Something went wrong",
				);
			},
		});
	};

	const handleDuplicate = (id: string) => {
		duplicateMutation.mutate(id, {
			onSuccess: () => {
				toast.success("Checklist template duplicated");
			},
			onError: (err) => {
				toast.error(
					err instanceof Error ? err.message : "Something went wrong",
				);
			},
		});
	};

	const handleCreateDialogOpenChange = (open: boolean) => {
		if (!open) {
			setCreateOpen(false);
			setEditId(null);
			setViewId(null);
		}
	};

	const handleDeleteDialogOpenChange = (open: boolean) => {
		if (!open) setDeleteId(null);
	};

	const editChecklist = useMemo(
		() => (editId ? checklists.find((c) => c.id === editId) : null),
		[editId, checklists],
	);

	const viewChecklist = useMemo(
		() => (viewId ? checklists.find((c) => c.id === viewId) : null),
		[viewId, checklists],
	);

	return {
		checklists,
		hasSearch,
		createOpen,
		editId,
		viewId,
		deleteId,
		search: localSearch,
		setSearch: handleSearchChange,
		page,
		goToPage,
		limit,
		setLimit,
		checklistToDelete,
		totalCount,
		pageCount,
		handleCreateSubmit,
		handleDeleteConfirm,
		handleDuplicate,
		setCreateOpen,
		setEditId,
		setViewId,
		setDeleteId,
		handleCreateDialogOpenChange,
		handleDeleteDialogOpenChange,
		editChecklist,
		viewChecklist,
		CARDS_PER_PAGE,
		PAGE_SIZE_OPTIONS,
		isSubmitting:
			createMutation.isPending ||
			updateMutation.isPending ||
			deleteMutation.isPending ||
			duplicateMutation.isPending,
	};
}
