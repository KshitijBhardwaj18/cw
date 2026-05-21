"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useOrgContext } from "@/contexts/org-context";
import {
	useCreateProject,
	useDeleteProject,
	useProjectsList,
	useUpdateProject,
} from "@/queries/projects.queries";
import type { ProjectFormValues } from "@/schemas";
import type { ProjectItem, ProjectStatus } from "@/types/project";
import {
	apiListRowToProjectItem,
	projectFormStatusToApi,
} from "@/utils/project-api";

const PAGE_SIZE = 6;

export const PROJ_PARAMS = {
	PAGE: "projPage",
	SEARCH: "projSearch",
	STATUS: "projStatus",
} as const;

export function useProjectsPage() {
	const { id: orgId } = useOrgContext();

	const { page, setPage, resetPage } = usePaginationControls({
		pageParamKey: PROJ_PARAMS.PAGE,
		defaultLimit: PAGE_SIZE,
	});

	const {
		searchValue,
		searchFromUrl,
		handleSearchChange,
		filterConfigs,
		values,
		onFilterChange,
	} = useSearchWithFilters({
		pagination: { pageParamKey: PROJ_PARAMS.PAGE },
		search: { paramKey: PROJ_PARAMS.SEARCH },
		filters: [
			{
				id: PROJ_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
				options: [
					{ label: "All Statuses", value: "all" },
					{ label: "Active", value: "Active" },
					{ label: "Inactive", value: "Inactive" },
				],
				placeholder: "All Statuses",
			},
		],
	});

	const status = values[PROJ_PARAMS.STATUS] as "all" | ProjectStatus;

	const [createOpen, setCreateOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<ProjectItem | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<ProjectItem | null>(
		null,
	);
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const setStatus = useCallback(
		(val: "all" | ProjectStatus) => {
			onFilterChange(PROJ_PARAMS.STATUS, val);
		},
		[onFilterChange],
	);

	const listQuery = useProjectsList(orgId, {
		search: searchFromUrl.trim() || undefined,
		projectStatus:
			status === "all"
				? undefined
				: status === "Active"
					? "ACTIVE"
					: "INACTIVE",
		page,
		limit: PAGE_SIZE,
	});

	const projects = useMemo(() => {
		return (listQuery.data?.data ?? []).map(apiListRowToProjectItem);
	}, [listQuery.data?.data]);

	const filteredCount = listQuery.data?.total ?? 0;
	const totalPages = listQuery.data?.totalPages ?? 1;

	const createMutation = useCreateProject(orgId);
	const updateMutation = useUpdateProject(orgId, editTarget?.id ?? undefined);
	const deleteMutation = useDeleteProject(orgId);

	const handleCreateProject = (values: ProjectFormValues) => {
		createMutation.mutate(
			{
				name: values.name,
				description: values.description || undefined,
				status: projectFormStatusToApi(values.status),
			},
			{
				onSuccess: () => {
					toast.success("Project created");
					setCreateOpen(false);
					resetPage();
				},
				onError: (e) =>
					toast.error(
						e instanceof Error ? e.message : "Could not create project",
					),
			},
		);
	};

	const handleUpdateProject = (values: ProjectFormValues) => {
		if (!editTarget) return;
		updateMutation.mutate(
			{
				name: values.name,
				description: values.description || undefined,
				status: projectFormStatusToApi(values.status),
			},
			{
				onSuccess: () => {
					toast.success("Project updated");
					setEditTarget(null);
				},
				onError: (e) =>
					toast.error(
						e instanceof Error ? e.message : "Could not update project",
					),
			},
		);
	};

	const handleDeletePrompt = (project: ProjectItem) => {
		setProjectToDelete(project);
		setDeleteOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!projectToDelete) return;
		deleteMutation.mutate(projectToDelete.id, {
			onSuccess: () => {
				toast.success("Project deleted");
				setDeleteOpen(false);
				setProjectToDelete(null);
				if (projects.length === 1 && page > 1) {
					setPage(Math.max(1, page - 1));
				}
			},
			onError: (e) =>
				toast.error(
					e instanceof Error ? e.message : "Could not delete project",
				),
		});
	};

	const isError = listQuery.isError;
	const listErrorMessage =
		listQuery.error instanceof Error
			? listQuery.error.message
			: "Could not load projects";

	const refetchList = useCallback(() => {
		void listQuery.refetch();
	}, [listQuery]);

	return {
		listQuery,
		projects,
		isError,
		listErrorMessage,
		refetchList,
		search: searchValue,
		setSearch: handleSearchChange,
		status,
		setStatus,
		createOpen,
		setCreateOpen,
		editTarget,
		setEditTarget,
		deleteOpen,
		setDeleteOpen,
		projectToDelete,
		setProjectToDelete,
		filtersExpanded,
		setFiltersExpanded,
		filteredCount,
		paginatedProjects: projects,
		currentPage: page,
		setCurrentPage: setPage,
		totalPages,
		filterConfigs,
		handleCreateProject,
		handleUpdateProject,
		handleDeletePrompt,
		handleConfirmDelete,
		createPending: createMutation.isPending,
		updatePending: updateMutation.isPending,
		deletePending: deleteMutation.isPending,
	};
}
