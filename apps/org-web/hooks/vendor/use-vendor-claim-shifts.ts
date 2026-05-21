"use client";

import { usePaginationControls } from "@repo/ui/hooks/use-pagination-controls";
import { useSearchWithFilters } from "@repo/ui/hooks/use-search-with-filters";
import { useTabSwitch } from "@repo/ui/hooks/use-tab-switch";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, Clock, LayoutGrid } from "lucide-react";
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

export const VENDOR_CLAIM_SHIFTS_PARAMS = {
	SEARCH: "vcsSearch",
	TAB: "vcsTab",
	URGENCY: "vcsUrg",
	SPECIALTY: "vcsSpec",
	AVAILABLE_PAGE: "vcsAvPg",
	ASSIGNED_PAGE: "vcsAsPg",
	AVAILABLE_LIMIT: "vcsAvLim",
	ASSIGNED_LIMIT: "vcsAsLim",
} as const;

export function useVendorClaimShifts() {
	const {
		page: availablePage,
		setPage: setAvailablePage,
		limit: availableLimit,
		setLimit: setAvailableLimit,
	} = usePaginationControls({
		pageParamKey: VENDOR_CLAIM_SHIFTS_PARAMS.AVAILABLE_PAGE,
		limitParamKey: VENDOR_CLAIM_SHIFTS_PARAMS.AVAILABLE_LIMIT,
		defaultLimit: 10,
	});

	const {
		page: assignedPage,
		setPage: setAssignedPage,
		limit: assignedLimit,
		setLimit: setAssignedLimit,
	} = usePaginationControls({
		pageParamKey: VENDOR_CLAIM_SHIFTS_PARAMS.ASSIGNED_PAGE,
		limitParamKey: VENDOR_CLAIM_SHIFTS_PARAMS.ASSIGNED_LIMIT,
		defaultLimit: 10,
	});

	const [activeTab, setActiveTab] = useTabSwitch(["available", "assigned"], {
		alsoClearParamKeys: [
			VENDOR_CLAIM_SHIFTS_PARAMS.AVAILABLE_PAGE,
			VENDOR_CLAIM_SHIFTS_PARAMS.ASSIGNED_PAGE,
		],
		paramKey: VENDOR_CLAIM_SHIFTS_PARAMS.TAB,
	});

	const {
		searchValue: localSearch,
		searchFromUrl,
		handleSearchChange: handleSearchChangeRaw,
		values,
		filterConfigs: hookFilterConfigs,
		onFilterChange: onFilterChangeRaw,
	} = useSearchWithFilters({
		pagination: { pageParamKey: VENDOR_CLAIM_SHIFTS_PARAMS.AVAILABLE_PAGE },
		search: {
			paramKey: VENDOR_CLAIM_SHIFTS_PARAMS.SEARCH,
			alsoClearParamKeys: [VENDOR_CLAIM_SHIFTS_PARAMS.ASSIGNED_PAGE],
		},
		filters: [
			{
				id: VENDOR_CLAIM_SHIFTS_PARAMS.URGENCY,
				label: "Urgency",
				type: "select",
				defaultValue: "all",
				placeholder: "All",
				options: URGENCY_OPTIONS,
			},
			{
				id: VENDOR_CLAIM_SHIFTS_PARAMS.SPECIALTY,
				label: "Specialty",
				type: "select",
				defaultValue: "all",
				placeholder: "All Specialties",
			},
		],
	});

	const handleSearchChange = useCallback(
		(v: string) => {
			handleSearchChangeRaw(v);
			setAssignedPage(1);
		},
		[handleSearchChangeRaw, setAssignedPage],
	);

	const onFilterChange = useCallback(
		(
			keyOrUpdates: string | Record<string, string | null>,
			value?: string | null,
		) => {
			onFilterChangeRaw(keyOrUpdates, value);
			setAssignedPage(1);
		},
		[onFilterChangeRaw, setAssignedPage],
	);

	const urgency = values[VENDOR_CLAIM_SHIFTS_PARAMS.URGENCY] || "all";
	const specialty = values[VENDOR_CLAIM_SHIFTS_PARAMS.SPECIALTY] || "all";

	const [filtersExpanded, setFiltersExpanded] = useState(false);

	const [selectedShift, setSelectedShift] = useState<ClaimableShift | null>(
		null,
	);
	const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
	const [isTimecardDialogOpen, setIsTimecardDialogOpen] = useState(false);

	const { data: sessionData } = authClient.useSession();
	const orgId = sessionData?.session?.activeOrganizationId ?? undefined;

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

	const filterConfigs = useMemo(() => {
		return hookFilterConfigs.map((cfg) => {
			if (cfg.id === VENDOR_CLAIM_SHIFTS_PARAMS.SPECIALTY) {
				return {
					...cfg,
					options: specialtyOptions,
					onValueChange: (v: string) =>
						onFilterChange(VENDOR_CLAIM_SHIFTS_PARAMS.SPECIALTY, v),
				};
			}
			if (cfg.id === VENDOR_CLAIM_SHIFTS_PARAMS.URGENCY) {
				return {
					...cfg,
					onValueChange: (v: string) =>
						onFilterChange(VENDOR_CLAIM_SHIFTS_PARAMS.URGENCY, v),
				};
			}
			return cfg;
		});
	}, [hookFilterConfigs, onFilterChange, specialtyOptions]);

	return {
		organizationId: orgId,
		searchValue: localSearch,
		setSearchValue: handleSearchChange,
		filtersExpanded,
		setFiltersExpanded,
		activeTab,
		setActiveTab,
		filters: { urgency, specialty },
		handleFilterChange: (key: string, v: string) => onFilterChange(key, v),
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
