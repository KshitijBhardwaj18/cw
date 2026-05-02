"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrgContext } from "@/contexts/org-context";
import {
	useAddProjectRequisitions,
	useProjectMeta,
	useProjectRequisitions,
	useProjectStats,
	useRemoveProjectRequisition,
} from "@/queries/projects.queries";
import type { ProjectRequisitionsListParams } from "@/services/projects.service";
import type { OrgJobCardItem } from "@/types/org-job";
import type { ProjectDetailRequisitionStatusFilter } from "@/types/project";

const REQUISITIONS_PAGE_SIZE = 20;

export function useProjectDetailsPage(projectId: string) {
	const { id: orgId } = useOrgContext();
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "reqSearch", pageParamKey: "reqPage" },
	);

	const [addRequisitionsOpen, setAddRequisitionsOpen] = useState(false);

	const pageParam = Number(searchParams.get("reqPage") ?? "1");
	const requisitionsPage =
		Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

	const statusParam = searchParams.get("reqStatus") ?? "all";
	const status =
		statusParam === "all" ||
		statusParam === "Open" ||
		statusParam === "Closed" ||
		statusParam === "On Hold"
			? (statusParam as ProjectDetailRequisitionStatusFilter)
			: "all";

	const listParams = useMemo<ProjectRequisitionsListParams>(
		() => ({
			search: searchFromUrl.trim() || undefined,
			requisitionStatus: status === "all" ? undefined : status,
			page: requisitionsPage,
			limit: REQUISITIONS_PAGE_SIZE,
		}),
		[searchFromUrl, status, requisitionsPage],
	);

	const metaQuery = useProjectMeta(orgId, projectId);
	const statsQuery = useProjectStats(orgId, projectId);
	const requisitionsQuery = useProjectRequisitions(
		orgId,
		projectId,
		listParams,
	);

	const addMutation = useAddProjectRequisitions(orgId, projectId);
	const removeMutation = useRemoveProjectRequisition(orgId, projectId);

	const requisitions = requisitionsQuery.data?.data ?? [];
	const requisitionsTotal = requisitionsQuery.data?.total ?? 0;
	const requisitionsTotalPages = requisitionsQuery.data?.totalPages ?? 1;

	useEffect(() => {
		if (
			requisitionsTotalPages >= 1 &&
			requisitionsPage > requisitionsTotalPages
		) {
			pushParams({ reqPage: String(requisitionsTotalPages) });
		}
	}, [requisitionsPage, requisitionsTotalPages, pushParams]);

	const setStatus = useCallback(
		(val: ProjectDetailRequisitionStatusFilter) => {
			pushParams({
				reqStatus: val === "all" ? null : val,
				reqPage: null,
			});
		},
		[pushParams],
	);

	const setRequisitionsPage = useCallback(
		(p: number) => {
			pushParams({ reqPage: String(p) });
		},
		[pushParams],
	);

	const filterConfigs = useMemo(
		() => [
			{
				id: "status",
				label: "Status",
				value: status,
				onValueChange: (val: string) =>
					setStatus(val as ProjectDetailRequisitionStatusFilter),
				placeholder: "All Statuses",
				options: [
					{ label: "All Statuses", value: "all" },
					{ label: "Open", value: "Open" },
					{ label: "Closed", value: "Closed" },
					{ label: "On Hold", value: "On Hold" },
				],
			},
		],
		[setStatus, status],
	);

	const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
	const [requisitionToRemove, setRequisitionToRemove] = useState<string | null>(
		null,
	);
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const handleAddRequisitions = (items: OrgJobCardItem[]) => {
		const ids = items.map((i) => i.id);
		if (ids.length === 0) return;
		addMutation.mutate(ids, {
			onSuccess: () => {
				toast.success(
					`Added ${ids.length} requisition${ids.length !== 1 ? "s" : ""} to project`,
				);
				setAddRequisitionsOpen(false);
			},
			onError: (e) =>
				toast.error(
					e instanceof Error ? e.message : "Could not add requisitions",
				),
		});
	};

	const handleRemovePrompt = (id: string) => {
		setRequisitionToRemove(id);
		setRemoveDialogOpen(true);
	};

	const handleConfirmRemove = () => {
		if (!requisitionToRemove) return;
		removeMutation.mutate(requisitionToRemove, {
			onSuccess: () => {
				toast.success("Requisition removed from project");
				setRemoveDialogOpen(false);
				setRequisitionToRemove(null);
			},
			onError: (e) =>
				toast.error(
					e instanceof Error ? e.message : "Could not remove requisition",
				),
		});
	};

	const refetchDetail = () => {
		void metaQuery.refetch();
		void statsQuery.refetch();
		void requisitionsQuery.refetch();
	};

	return {
		metaQuery,
		statsQuery,
		requisitionsQuery,
		meta: metaQuery.data ?? null,
		stats: statsQuery.data ?? null,
		requisitions,
		requisitionsTotal,
		requisitionsPage,
		setRequisitionsPage,
		requisitionsTotalPages,
		addRequisitionsOpen,
		setAddRequisitionsOpen,
		search: localSearch,
		setSearch: handleSearchChange,
		status,
		setStatus,
		removeDialogOpen,
		setRemoveDialogOpen,
		requisitionToRemove,
		filtersExpanded,
		setFiltersExpanded,
		filterConfigs,
		handleRemovePrompt,
		handleConfirmRemove,
		handleAddRequisitions,
		removePending: removeMutation.isPending,
		addPending: addMutation.isPending,
		refetchDetail,
	};
}
