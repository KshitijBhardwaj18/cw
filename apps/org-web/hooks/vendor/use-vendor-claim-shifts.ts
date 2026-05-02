"use client";

import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useUrlQueryState } from "@repo/ui/hooks/use-url-query-state";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, Clock, LayoutGrid } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { URGENCY_OPTIONS } from "@/constants/vendor/shift-claiming";
import { authClient } from "@/lib/auth-client";
import { useOrgLinkedOccupationSpecialties } from "@/queries/talent-community.queries";
import {
	useVendorAssignShift,
	vendorShiftClaimingKeys,
} from "@/queries/vendor-shift-claiming.queries";
import { PerDiemShiftsService } from "@/services/per-diem-shifts.service";
import type { ClaimableShift } from "@/types/vendor-claim-shifts";

export function useVendorClaimShifts() {
	const searchParams = useSearchParams();
	const { pushParams } = useUrlQueryState();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			paramKey: "vcsSearch",
			pageParamKey: null,
			alsoClearParamKeys: ["vcsAvPg", "vcsAsPg"],
		},
	);

	const [filtersExpanded, setFiltersExpanded] = useState(false);
	const activeTab =
		searchParams.get("vcsTab") === "assigned" ? "assigned" : "available";
	const urgency = searchParams.get("vcsUrg") ?? "all";
	const specialty = searchParams.get("vcsSpec") ?? "all";

	const avPageParam = Number(searchParams.get("vcsAvPg") ?? "1");
	const availablePage =
		Number.isFinite(avPageParam) && avPageParam > 0 ? avPageParam : 1;
	const asPageParam = Number(searchParams.get("vcsAsPg") ?? "1");
	const assignedPage =
		Number.isFinite(asPageParam) && asPageParam > 0 ? asPageParam : 1;

	const avLimitParam = Number(searchParams.get("vcsAvLim") ?? "10");
	const availableLimit =
		Number.isFinite(avLimitParam) && avLimitParam > 0 ? avLimitParam : 10;
	const asLimitParam = Number(searchParams.get("vcsAsLim") ?? "10");
	const assignedLimit =
		Number.isFinite(asLimitParam) && asLimitParam > 0 ? asLimitParam : 10;

	const [selectedShift, setSelectedShift] = useState<ClaimableShift | null>(
		null,
	);
	const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
	const [isTimecardDialogOpen, setIsTimecardDialogOpen] = useState(false);

	const { data: sessionData } = authClient.useSession();
	const orgId = sessionData?.session?.activeOrganizationId ?? undefined;

	const setActiveTab = useCallback(
		(tab: string) => {
			pushParams({ vcsTab: tab === "available" ? null : tab });
		},
		[pushParams],
	);

	const availableParams = useMemo(
		() => ({
			page: availablePage,
			limit: availableLimit,
			search: searchFromUrl || undefined,
			...(urgency !== "all"
				? { urgency: urgency as "high" | "medium" | "low" }
				: {}),
			...(specialty !== "all" ? { specialtyId: specialty } : {}),
		}),
		[availablePage, availableLimit, searchFromUrl, urgency, specialty],
	);

	const assignedParams = useMemo(
		() => ({
			page: assignedPage,
			limit: assignedLimit,
			search: searchFromUrl || undefined,
			...(urgency !== "all"
				? { urgency: urgency as "high" | "medium" | "low" }
				: {}),
			...(specialty !== "all" ? { specialtyId: specialty } : {}),
		}),
		[assignedPage, assignedLimit, searchFromUrl, urgency, specialty],
	);

	const metricsQuery = useQuery({
		queryKey: vendorShiftClaimingKeys.metrics(),
		queryFn: () => {
			if (!orgId) throw new Error("Missing organization");
			return PerDiemShiftsService.getVendorShiftMetrics();
		},
		enabled: Boolean(orgId),
	});

	const orgLinkedSpecialtiesQuery = useOrgLinkedOccupationSpecialties(
		orgId ?? "",
	);

	const availableQuery = useQuery({
		queryKey: vendorShiftClaimingKeys.available(availableParams),
		queryFn: () => {
			if (!orgId) throw new Error("Missing organization");
			return PerDiemShiftsService.listVendorAvailable(availableParams);
		},
		enabled: Boolean(orgId),
	});

	const assignedQuery = useQuery({
		queryKey: vendorShiftClaimingKeys.assigned(assignedParams),
		queryFn: () => {
			if (!orgId) throw new Error("Missing organization");
			return PerDiemShiftsService.listVendorAssigned(assignedParams);
		},
		enabled: Boolean(orgId),
	});

	const candidatesQuery = useQuery({
		queryKey: vendorShiftClaimingKeys.candidates(selectedShift?.id),
		queryFn: async () => {
			if (!selectedShift || !orgId) throw new Error("Missing shift or org");
			const res = await PerDiemShiftsService.listVendorAssignableCandidates(
				selectedShift.id,
			);
			return res.data;
		},
		enabled: Boolean(orgId && selectedShift && isClaimDialogOpen),
	});

	const assignMutation = useVendorAssignShift();

	const specialtyOptions = useMemo(() => {
		const list = orgLinkedSpecialtiesQuery.data ?? [];
		const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));
		return [
			{ value: "all", label: "All Specialties" },
			...sorted.map((s) => ({ value: s.id, label: s.name })),
		];
	}, [orgLinkedSpecialtiesQuery.data]);

	const metricStats: Array<{
		title: string;
		value: string;
		variant: "primary" | "error" | "warning" | "success";
		icon: LucideIcon;
	}> = useMemo(() => {
		const m = metricsQuery.data;
		if (!m) {
			return [
				{
					title: "Total Shifts",
					value: "—",
					variant: "primary",
					icon: LayoutGrid,
				},
				{
					title: "High Urgency",
					value: "—",
					variant: "error",
					icon: AlertCircle,
				},
				{
					title: "In Progress",
					value: "—",
					variant: "warning",
					icon: Clock,
				},
				{
					title: "Completed",
					value: "—",
					variant: "success",
					icon: CheckCircle2,
				},
			];
		}
		return [
			{
				title: "Total Shifts",
				value: String(m.totalShifts),
				variant: "primary",
				icon: LayoutGrid,
			},
			{
				title: "High Urgency",
				value: String(m.highUrgency),
				variant: "error",
				icon: AlertCircle,
			},
			{
				title: "In Progress",
				value: String(m.inProgress),
				variant: "warning",
				icon: Clock,
			},
			{
				title: "Completed",
				value: String(m.completed),
				variant: "success",
				icon: CheckCircle2,
			},
		];
	}, [metricsQuery.data]);

	const setAvailablePage = useCallback(
		(p: number) => {
			pushParams({ vcsAvPg: String(p) });
		},
		[pushParams],
	);
	const setAssignedPage = useCallback(
		(p: number) => {
			pushParams({ vcsAsPg: String(p) });
		},
		[pushParams],
	);
	const setAvailableLimit = useCallback(
		(l: number) => {
			pushParams({ vcsAvLim: String(l), vcsAvPg: null });
		},
		[pushParams],
	);
	const setAssignedLimit = useCallback(
		(l: number) => {
			pushParams({ vcsAsLim: String(l), vcsAsPg: null });
		},
		[pushParams],
	);

	const handleFilterChange = useCallback(
		(key: "urgency" | "specialty", value: string) => {
			const clear = !value || value === "all";
			if (key === "urgency") {
				pushParams({
					vcsUrg: clear ? null : value,
					vcsAvPg: null,
					vcsAsPg: null,
				});
			} else {
				pushParams({
					vcsSpec: clear ? null : value,
					vcsAvPg: null,
					vcsAsPg: null,
				});
			}
		},
		[pushParams],
	);

	const handleAction = useCallback((shift: ClaimableShift) => {
		setSelectedShift(shift);
		setIsClaimDialogOpen(true);
	}, []);

	const handleTimecardAction = useCallback((shift: ClaimableShift) => {
		setSelectedShift(shift);
		setIsTimecardDialogOpen(true);
	}, []);

	const dismissTimecardDialog = useCallback(() => {
		setIsTimecardDialogOpen(false);
		setSelectedShift(null);
	}, []);

	const handleConfirmClaim = useCallback(
		(candidateId: string) => {
			if (!orgId || !selectedShift) return;
			assignMutation.mutate(
				{ shiftId: selectedShift.id, candidateId },
				{
					onSuccess: () => {
						toast.success(
							`Successfully assigned candidate to ${selectedShift.facilityName.split("-")[0]?.trim() ?? "facility"}`,
						);
						setIsClaimDialogOpen(false);
						setSelectedShift(null);
					},
					onError: (err) =>
						toast.error(
							err instanceof Error ? err.message : "Could not assign candidate",
						),
				},
			);
		},
		[assignMutation, selectedShift, orgId],
	);

	const availableShifts = availableQuery.data?.data ?? [];
	const assignedShifts = assignedQuery.data?.data ?? [];
	const totalAvailableCount = availableQuery.data?.total ?? 0;
	const totalAssignedCount = assignedQuery.data?.total ?? 0;

	const availablePageCount = availableQuery.data?.totalPages ?? 0;
	const assignedPageCount = assignedQuery.data?.totalPages ?? 0;

	const hasActiveFilters =
		Boolean(searchFromUrl?.trim()) || urgency !== "all" || specialty !== "all";

	const filterConfigs = useMemo(
		() => [
			{
				id: "vendor-claim-urgency",
				label: "Urgency",
				value: urgency,
				onValueChange: (v: string) => handleFilterChange("urgency", v),
				placeholder: "All",
				options: URGENCY_OPTIONS,
			},
			{
				id: "vendor-claim-specialty",
				label: "Specialty",
				value: specialty,
				onValueChange: (v: string) => handleFilterChange("specialty", v),
				placeholder: "All Specialties",
				options: specialtyOptions,
			},
		],
		[handleFilterChange, specialty, specialtyOptions, urgency],
	);

	return {
		organizationId: orgId,
		searchValue: localSearch,
		setSearchValue: handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		activeTab,
		setActiveTab,
		filters: { urgency, specialty },
		handleFilterChange,
		filteredAvailableShifts: availableShifts,
		filteredAssignedShifts: assignedShifts,
		selectedShift,
		isClaimDialogOpen,
		setIsClaimDialogOpen,
		isTimecardDialogOpen,
		setIsTimecardDialogOpen,
		handleAction,
		handleTimecardAction,
		dismissTimecardDialog,
		handleConfirmClaim,
		totalAvailableCount,
		totalAssignedCount,
		metricStats,
		specialtyOptions,
		urgencyOptions: URGENCY_OPTIONS,
		assignableCandidates: candidatesQuery.data ?? [],
		isLoadingCandidates: candidatesQuery.isFetching,
		availablePagination: {
			currentPage: availablePage,
			pageCount: Math.max(availablePageCount, 1),
			goToPage: setAvailablePage,
			limit: availableLimit,
			setLimit: setAvailableLimit,
		},
		assignedPagination: {
			currentPage: assignedPage,
			pageCount: Math.max(assignedPageCount, 1),
			goToPage: setAssignedPage,
			limit: assignedLimit,
			setLimit: setAssignedLimit,
		},
		hasActiveFilters,
		headerShiftTotal: totalAvailableCount + totalAssignedCount,
		filterConfigs,
	};
}
