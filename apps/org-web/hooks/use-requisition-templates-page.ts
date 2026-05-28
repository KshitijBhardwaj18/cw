"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { REQUISITION_STATUS_FILTER_OPTIONS } from "@/constants/requisition-templates";
import { useRequisitionTemplates } from "@/queries/requisition-templates.queries";
import { useShiftTemplateOccupations } from "@/queries/shift-templates.queries";
import type { RequisitionTemplateType } from "@/types/requisition-template";

const DEFAULT_LIMIT = 12;
const PAGE_SIZE_OPTIONS = [6, 12, 18, 24];

const RT_PARAMS = {
	SEARCH: "rtSearch",
	PAGE: "rtPage",
	LIMIT: "rtLimit",
	OCCUPATION: "rtOcc",
	SPECIALTY: "rtSpec",
	STATUS: "rtStatus",
} as const;

export function useRequisitionTemplatesPage() {
	const router = useRouter();

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const { page, limit, setPage, setLimit } = usePaginationControls({
		pageParamKey: RT_PARAMS.PAGE,
		limitParamKey: RT_PARAMS.LIMIT,
		defaultLimit: DEFAULT_LIMIT,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange,
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange,
	} = useSearchWithFilters({
		search: { paramKey: RT_PARAMS.SEARCH },
		pagination: { pageParamKey: RT_PARAMS.PAGE },
		filters: [
			{
				id: RT_PARAMS.OCCUPATION,
				label: "Occupation",
				type: "select",
				defaultValue: "all",
			},
			{
				id: RT_PARAMS.SPECIALTY,
				label: "Specialty",
				type: "select",
				defaultValue: "all",
			},
			{
				id: RT_PARAMS.STATUS,
				label: "Status",
				type: "select",
				defaultValue: "all",
				placeholder: "All Statuses",
				options: REQUISITION_STATUS_FILTER_OPTIONS,
			},
		],
	});

	const filters = useMemo(
		() => ({
			occupation: (values[RT_PARAMS.OCCUPATION] as string) || "all",
			specialty: (values[RT_PARAMS.SPECIALTY] as string) || "all",
			status: (values[RT_PARAMS.STATUS] as string) || "all",
		}),
		[values],
	);

	const listQuery = useRequisitionTemplates({
		search: searchFromUrl.trim() || undefined,
		status: filters.status === "all" ? undefined : filters.status,
		organizationOccupationId:
			filters.occupation === "all" ? undefined : filters.occupation,
		organizationSpecialtyId:
			filters.specialty === "all" ? undefined : filters.specialty,
		page,
		limit,
	});

	const templates = listQuery.data?.data ?? [];
	const totalCount = listQuery.data?.total ?? 0;
	const totalPages = listQuery.data?.totalPages ?? 1;

	const occupationsQuery = useShiftTemplateOccupations();

	const occupationOptions = useMemo(
		() => [
			{ value: "all", label: "All Occupations" },
			...(occupationsQuery.data ?? []).map((o) => ({
				value: o.organizationOccupationId,
				label: o.name,
			})),
		],
		[occupationsQuery.data],
	);

	const specialtyOptions = useMemo(() => {
		if (filters.occupation === "all") {
			return [{ value: "all", label: "All Specialties" }];
		}
		const occ = occupationsQuery.data?.find(
			(o) => o.organizationOccupationId === filters.occupation,
		);
		const fromLinked = occ?.organizationSpecialties ?? [];
		return [
			{ value: "all", label: "All Specialties" },
			...fromLinked.map((s) => ({ value: s.id, label: s.name })),
		];
	}, [filters.occupation, occupationsQuery.data]);

	const filterConfigs = useMemo(() => {
		return hookFilterConfigs.map((cfg) => {
			switch (cfg.id) {
				case RT_PARAMS.OCCUPATION:
					return {
						...cfg,
						placeholder: "All Occupations",
						options: occupationOptions,
						onValueChange: (v: string) => {
							const updates: Record<string, string | null> = {
								[RT_PARAMS.OCCUPATION]: v || null,
							};
							if (values[RT_PARAMS.OCCUPATION] !== v) {
								updates[RT_PARAMS.SPECIALTY] = null;
							}
							onFilterChange(updates);
						},
					};
				case RT_PARAMS.SPECIALTY:
					return {
						...cfg,
						placeholder: "All Specialties",
						options: specialtyOptions,
					};
				default:
					return cfg;
			}
		});
	}, [
		hookFilterConfigs,
		occupationOptions,
		specialtyOptions,
		onFilterChange,
		values,
	]);

	const hasActiveFilters = useMemo(() => {
		return (
			searchFromUrl.trim() !== "" ||
			filters.occupation !== "all" ||
			filters.specialty !== "all" ||
			filters.status !== "all"
		);
	}, [filters, searchFromUrl]);

	const handleCreateTypeSelect = (type: RequisitionTemplateType) => {
		setCreateDialogOpen(false);
		router.push(`/org/requisition-templates/create?type=${type}`);
	};

	const handleEdit = (id: string) => {
		router.push(`/org/requisition-templates/${id}/edit`);
	};

	const handleUseTemplate = (id: string) => {
		router.push(`/org/jobs/create?templateId=${id}`);
	};

	const handleViewDetails = (id: string) => {
		router.push(`/org/requisition-templates/${id}`);
	};

	const listErrorMessage =
		listQuery.error instanceof Error
			? listQuery.error.message
			: "Could not load requisition templates";

	return {
		createDialogOpen,
		setCreateDialogOpen,
		localSearch,
		handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		templates,
		totalCount,
		page,
		totalPages,
		setPage,
		limit,
		setLimit,
		pageSizeOptions: PAGE_SIZE_OPTIONS,
		filterConfigs,
		hasActiveFilters,
		isLoading: listQuery.isLoading,
		isError: listQuery.isError,
		listErrorMessage,
		refetchTemplates: listQuery.refetch,
		handleCreateTypeSelect,
		handleEdit,
		handleUseTemplate,
		handleViewDetails,
	};
}
