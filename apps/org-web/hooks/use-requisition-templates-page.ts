"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { REQUISITION_STATUS_FILTER_OPTIONS } from "@/constants/requisition-templates";
import { useOrgContext } from "@/contexts/org-context";
import { useRequisitionTemplates } from "@/queries/requisition-templates.queries";
import { useShiftTemplateOccupations } from "@/queries/shift-templates.queries";
import { useSpecialtiesForOccupation } from "@/queries/talent-community.queries";
import type { RequisitionTemplateType } from "@/types/requisition-template";

export function useRequisitionTemplatesPage() {
	const { id: orgId } = useOrgContext();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{ paramKey: "rtSearch", pageParamKey: null },
	);

	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const occupationFilter = searchParams.get("rtOcc") ?? "all";
	const specialtyFilter = searchParams.get("rtSpec") ?? "all";
	const statusFilter = searchParams.get("rtStatus") ?? "all";

	const setOccupationFilter = useCallback(
		(v: string) => {
			const clear = !v || v === "all";
			const prevOcc = searchParams.get("rtOcc") ?? "all";
			const nextOcc = clear ? "all" : v;
			const updates: Record<string, string | null> = {
				rtOcc: clear ? null : v,
			};
			if (prevOcc !== nextOcc) {
				updates.rtSpec = null;
			}
			pushParams(updates);
		},
		[pushParams, searchParams],
	);

	const setSpecialtyFilter = useCallback(
		(v: string) => {
			const clear = !v || v === "all";
			pushParams({ rtSpec: clear ? null : v });
		},
		[pushParams],
	);

	const setStatusFilter = useCallback(
		(v: string) => {
			const clear = !v || v === "all";
			pushParams({ rtStatus: clear ? null : v });
		},
		[pushParams],
	);

	const templatesQuery = useRequisitionTemplates(orgId, {
		search: searchFromUrl.trim() || undefined,
		status: statusFilter === "all" ? undefined : statusFilter,
		page: 1,
		limit: 50,
	});
	const templates = templatesQuery.data?.data ?? [];

	const occupationsQuery = useShiftTemplateOccupations();
	const selectedOccupation = (occupationsQuery.data ?? []).find(
		(o) => o.id === occupationFilter,
	);
	const specialtiesQuery = useSpecialtiesForOccupation(
		orgId,
		occupationFilter === "all" ? null : occupationFilter,
	);

	const occupationOptions = useMemo(
		() => [
			{ value: "all", label: "All Occupations" },
			...(occupationsQuery.data ?? []).map((o) => ({
				value: o.id,
				label: o.name,
			})),
		],
		[occupationsQuery.data],
	);

	const specialtyOptions = useMemo(() => {
		if (occupationFilter === "all") {
			return [{ value: "all", label: "All Specialties" }];
		}
		return [
			{ value: "all", label: "All Specialties" },
			...(specialtiesQuery.data ?? []).map((s) => ({
				value: s.id,
				label: s.name,
			})),
		];
	}, [occupationFilter, specialtiesQuery.data]);

	const filteredTemplates = useMemo(() => {
		return templates.filter((t) => {
			const matchesSearch =
				!searchFromUrl.trim() ||
				[t.title, t.occupation, t.specialty]
					.join(" ")
					.toLowerCase()
					.includes(searchFromUrl.trim().toLowerCase());
			const matchesOccupation =
				occupationFilter === "all" ||
				t.occupation === (selectedOccupation?.name ?? "");
			const matchesSpecialty =
				specialtyFilter === "all" || t.specialty === specialtyFilter;
			const matchesStatus = statusFilter === "all" || t.status === statusFilter;

			return (
				matchesSearch && matchesOccupation && matchesSpecialty && matchesStatus
			);
		});
	}, [
		templates,
		searchFromUrl,
		occupationFilter,
		specialtyFilter,
		statusFilter,
		selectedOccupation?.name,
	]);

	const filterConfigs = useMemo(
		() => [
			{
				id: "filter-occupation",
				label: "Occupation",
				value: occupationFilter,
				onValueChange: setOccupationFilter,
				placeholder: "All Occupations",
				options: occupationOptions,
			},
			{
				id: "filter-specialty",
				label: "Specialty",
				value: specialtyFilter,
				onValueChange: setSpecialtyFilter,
				placeholder: "All Specialties",
				options: specialtyOptions,
			},
			{
				id: "filter-status",
				label: "Status",
				value: statusFilter,
				onValueChange: setStatusFilter,
				placeholder: "All Statuses",
				options: REQUISITION_STATUS_FILTER_OPTIONS,
			},
		],
		[
			occupationFilter,
			occupationOptions,
			setOccupationFilter,
			setSpecialtyFilter,
			setStatusFilter,
			specialtyFilter,
			specialtyOptions,
			statusFilter,
		],
	);

	const hasFilters =
		Boolean(searchFromUrl.trim()) ||
		occupationFilter !== "all" ||
		specialtyFilter !== "all" ||
		statusFilter !== "all";

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

	return {
		createDialogOpen,
		setCreateDialogOpen,
		search: localSearch,
		setSearch: handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		templates,
		filteredTemplates,
		filterConfigs,
		hasFilters,
		handleCreateTypeSelect,
		handleEdit,
		handleUseTemplate,
		handleViewDetails,
	};
}
