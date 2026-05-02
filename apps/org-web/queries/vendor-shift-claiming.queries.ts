import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PerDiemShiftsService } from "@/services/per-diem-shifts.service";
import type { SubmitShiftTimecardPayload } from "@/types/candidate-shifts";

export const vendorShiftClaimingKeys = {
	all: ["vendor-shift-claiming"] as const,
	metrics: () => [...vendorShiftClaimingKeys.all, "metrics"] as const,
	available: (params: Record<string, unknown>) =>
		[...vendorShiftClaimingKeys.all, "available", params] as const,
	assigned: (params: Record<string, unknown>) =>
		[...vendorShiftClaimingKeys.all, "assigned", params] as const,
	candidates: (shiftId: string | undefined) =>
		[...vendorShiftClaimingKeys.all, "candidates", shiftId ?? ""] as const,
};

export function useVendorAssignShift() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			shiftId,
			candidateId,
		}: {
			shiftId: string;
			candidateId: string;
		}) => PerDiemShiftsService.assignShiftToCandidate(shiftId, candidateId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: vendorShiftClaimingKeys.all,
			});
		},
	});
}

export function useVendorSubmitAssignmentTimecard() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			assignmentId,
			payload,
		}: {
			assignmentId: string;
			payload: SubmitShiftTimecardPayload;
		}) =>
			PerDiemShiftsService.submitVendorAssignmentTimecard(
				assignmentId,
				payload,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: vendorShiftClaimingKeys.all,
			});
		},
	});
}
