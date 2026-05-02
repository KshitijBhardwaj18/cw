"use client";

import { COMMAND_CENTER_EMPTY_WORKFORCE_COUNTS } from "@repo/shared";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CommandCenterService } from "@/services/command-center.service";
import type { ActiveWorkforceCountsByType } from "@/types/command-center";

const OCCUPATION_PARAM = "occupation";

const EMPTY_COUNTS: ActiveWorkforceCountsByType =
	COMMAND_CENTER_EMPTY_WORKFORCE_COUNTS;

export function useActiveWorkforce() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const selectedOccupationId = searchParams.get(OCCUPATION_PARAM) ?? "all";

	const workforceQuery = useQuery({
		queryKey: ["command-center", "active-workforce", selectedOccupationId],
		queryFn: () =>
			CommandCenterService.getActiveWorkforce(selectedOccupationId),
	});

	const occupations = workforceQuery.data?.occupations ?? [
		{ id: "all", name: "All Occupations" },
	];
	const resolvedSelectedOccupationId =
		workforceQuery.data?.selectedOccupationId ?? "all";
	const workforceCountsByType =
		workforceQuery.data?.workforceCountsByType ?? EMPTY_COUNTS;

	const setSelectedOccupation = useCallback(
		(occupationId: string) => {
			const nextParams = new URLSearchParams(searchParams.toString());
			nextParams.set(OCCUPATION_PARAM, occupationId);
			const nextQuery = nextParams.toString();
			router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
				scroll: false,
			});
		},
		[pathname, router, searchParams],
	);

	return {
		occupations,
		selectedOccupationId: resolvedSelectedOccupationId,
		workforceCountsByType,
		isLoading: workforceQuery.isLoading,
		isError: workforceQuery.isError,
		setSelectedOccupation,
	};
}
