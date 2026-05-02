"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useSearchParams } from "next/navigation";
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

function parseStatusParam(raw: string | null): "all" | ProjectStatus {
	if (raw === "Active" || raw === "Inactive") return raw;
	return "all";
}

export function useProjectsPage() {
	const { id: orgId } = useOrgContext();
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "projSearch", pageParamKey: "projPage" },
	);

	const pageParam = Number(searchParams.get("projPage") ?? "1");
	const currentPage =
		Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
	const status = parseStatusParam(searchParams.get("projStatus"));

	const [createOpen, setCreateOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<ProjectItem | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<ProjectItem | null>(
		null,
	);
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const setCurrentPage = useCallback(
		(p: number) => {
			pushParams({ projPage: String(p) });
		},
		[pushParams],
	);

	const setStatus = useCallback(
		(val: "all" | ProjectStatus) => {
			pushParams({
				projStatus: val === "all" ? null : val,
				projPage: null,
			});
		},
		[pushParams],
	);

	const listQuery = useProjectsList(orgId, {
		search: searchFromUrl.trim() || undefined,
		projectStatus:
			status === "all"
				? undefined
				: status === "Active"
					? "ACTIVE"
					: "INACTIVE",
		page: currentPage,
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
					pushParams({ page: null });
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
				if (projects.length === 1 && currentPage > 1) {
					pushParams({ page: String(Math.max(1, currentPage - 1)) });
				}
			},
			onError: (e) =>
				toast.error(
					e instanceof Error ? e.message : "Could not delete project",
				),
		});
	};

	const filterConfigs = useMemo(
		() => [
			{
				id: "status",
				label: "Status",
				value: status,
				onValueChange: (val: string) => setStatus(val as "all" | ProjectStatus),
				placeholder: "All Statuses",
				options: [
					{ label: "All Statuses", value: "all" },
					{ label: "Active", value: "Active" },
					{ label: "Inactive", value: "Inactive" },
				],
			},
		],
		[setStatus, status],
	);

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
		search: localSearch,
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
		currentPage,
		setCurrentPage,
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
