import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreatePerDiemShiftInput } from "@/services/per-diem-shifts.service";
import { PerDiemShiftsService } from "@/services/per-diem-shifts.service";

export const perDiemShiftKeys = {
	all: ["per-diem-shifts"] as const,
};

export function useCreatePerDiemShift() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreatePerDiemShiftInput) =>
			PerDiemShiftsService.create(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: perDiemShiftKeys.all });
		},
	});
}

export function useCancelPerDiemShift() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { shiftId: string; reason?: string }) =>
			PerDiemShiftsService.cancel(input.shiftId, {
				reason: input.reason,
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: perDiemShiftKeys.all });
		},
	});
}
