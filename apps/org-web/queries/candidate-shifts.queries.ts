"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type CandidateShiftsQueryParams,
	CandidateShiftsService,
} from "@/services/candidate-shifts.service";
import type { SubmitShiftTimecardPayload } from "@/types/candidate-shifts";

export const candidateShiftsKeys = {
	all: ["candidate-shifts"] as const,
	available: (params: CandidateShiftsQueryParams) =>
		[...candidateShiftsKeys.all, "available", params] as const,
	my: (params: CandidateShiftsQueryParams) =>
		[...candidateShiftsKeys.all, "my", params] as const,
	counts: () => [...candidateShiftsKeys.all, "counts"] as const,
	calendar: (year: number, month: number) =>
		[...candidateShiftsKeys.all, "calendar", year, month] as const,
};

export function useCandidateAvailableShifts(
	params: CandidateShiftsQueryParams,
) {
	return useQuery({
		queryKey: candidateShiftsKeys.available(params),
		queryFn: () => CandidateShiftsService.getAvailableShifts(params),
		refetchOnMount: "always",
	});
}

export function useCandidateMyShifts(params: CandidateShiftsQueryParams) {
	return useQuery({
		queryKey: candidateShiftsKeys.my(params),
		queryFn: () => CandidateShiftsService.getMyShifts(params),
		refetchOnMount: "always",
	});
}

export function useCandidateShiftCounts() {
	return useQuery({
		queryKey: candidateShiftsKeys.counts(),
		queryFn: () => CandidateShiftsService.getCounts(),
		refetchOnMount: "always",
	});
}

export function useCandidateShiftsCalendar(year: number, month: number) {
	return useQuery({
		queryKey: candidateShiftsKeys.calendar(year, month),
		queryFn: () => CandidateShiftsService.getCalendarShifts(year, month),
		refetchOnMount: "always",
	});
}

export function useClaimShift() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (shiftId: string) => CandidateShiftsService.claimShift(shiftId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: candidateShiftsKeys.all,
			});
		},
	});
}

export function useSubmitShiftTimecard() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			shiftId,
			payload,
		}: {
			shiftId: string;
			payload: SubmitShiftTimecardPayload;
		}) => CandidateShiftsService.submitTimecard(shiftId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: candidateShiftsKeys.all });
		},
	});
}
