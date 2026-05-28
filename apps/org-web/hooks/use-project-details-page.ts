"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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

const DEFAULT_LIMIT = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const PROJECT_DETAILS_PARAMS = {
	SEARCH: "reqSearch",
	PAGE: "reqPage",
	LIMIT: "reqLimit",
	STATUS: "reqStatus",
} as const;

export function useProjectDetailsPage(projectId: string) {
	const {
		page: requisitionsPage,
		limit: requisitionsLimit,
		setPage: setRequisitionsPage,
		setLimit: setRequisitionsLimit,
	} = usePaginationControls({
		pageParamKey: PROJECT_DETAILS_PARAMS.PAGE,
		limitParamKey: PROJECT_DETAILS_PARAMS.LIMIT,
		defaultLimit: DEFAULT_LIMIT,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs,
	} = useSearchWithFilters({
		search: { paramKey: PROJECT_DETAILS_PARAMS.SEARCH },
		pagination: { pageParamKey: PROJECT_DETAILS_PARAMS.PAGE },
		filters: [
			{
				id: PROJECT_DETAILS_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
				options: [
					{ label: "All Statuses", value: "all" },
					{ label: "Draft", value: "DRAFT" },
					{ label: "Active", value: "ACTIVE" },
					{ label: "Inactive", value: "INACTIVE" },
					{ label: "Pending Approval", value: "PENDING_APPROVAL" },
					{ label: "Approved", value: "APPROVED" },
					{ label: "Published", value: "PUBLISHED" },
					{ label: "On Hold", value: "ON_HOLD" },
					{ label: "Filled", value: "FILLED" },
					{ label: "Cancelled", value: "CANCELLED" },
					{ label: "Closed", value: "CLOSED" },
				],
			},
		],
	});

	const status =
		(values[
			PROJECT_DETAILS_PARAMS.STATUS
		] as ProjectDetailRequisitionStatusFilter) || "all";

	const listParams = useMemo<ProjectRequisitionsListParams>(
		() => ({
			search: searchFromUrl.trim() || undefined,
			requisitionStatus: status === "all" ? undefined : status,
			page: requisitionsPage,
			limit: requisitionsLimit,
		}),
		[searchFromUrl, status, requisitionsPage, requisitionsLimit],
	);

	const metaQuery = useProjectMeta(projectId);
	const statsQuery = useProjectStats(projectId);
	const requisitionsQuery = useProjectRequisitions(projectId, listParams);

	const addMutation = useAddProjectRequisitions(projectId);
	const removeMutation = useRemoveProjectRequisition(projectId);

	const requisitions = requisitionsQuery.data?.data ?? [];
	const requisitionsTotal = requisitionsQuery.data?.total ?? 0;
	const requisitionsTotalPages = requisitionsQuery.data?.totalPages ?? 1;

	const [addRequisitionsOpen, setAddRequisitionsOpen] = useState(false);
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
		requisitionsLimit,
		setRequisitionsLimit,
		requisitionsPageSizeOptions: PAGE_SIZE_OPTIONS,
		requisitionsTotalPages,
		addRequisitionsOpen,
		setAddRequisitionsOpen,
		localSearch,
		handleSearchChange,
		status,
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
