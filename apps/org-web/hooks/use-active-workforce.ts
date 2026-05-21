"use client";

import { COMMAND_CENTER_EMPTY_WORKFORCE_COUNTS } from "@repo/shared";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { CommandCenterService } from "@/services/command-center.service";
import type { ActiveWorkforceCountsByType } from "@/types/command-center";

export const ACTIVE_WORKFORCE_PARAMS = {
	OCCUPATION: "occupation",
} as const;

const EMPTY_COUNTS: ActiveWorkforceCountsByType =
	COMMAND_CENTER_EMPTY_WORKFORCE_COUNTS;

export function useActiveWorkforce() {
	const [selectedOccupationId, setSelectedOccupationId] = useQueryState(
		ACTIVE_WORKFORCE_PARAMS.OCCUPATION,
		{ defaultValue: "all" },
	);

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

	return {
		occupations,
		selectedOccupationId: resolvedSelectedOccupationId,
		workforceCountsByType,
		isLoading: workforceQuery.isLoading,
		isError: workforceQuery.isError,
		setSelectedOccupation: setSelectedOccupationId,
	};
}
