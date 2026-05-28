import type { SyncTiersPayload } from "@repo/shared";
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type { UpdateRoutingSettingsInput } from "@/services/shift-routing.service";
import { ShiftRoutingService } from "@/services/shift-routing.service";

export const shiftRoutingKeys = {
	all: ["shift-routing"] as const,
	settings: () => [...shiftRoutingKeys.all, "settings"] as const,
};

export function useShiftRoutingSettings() {
	return useQuery({
		queryKey: shiftRoutingKeys.settings(),
		queryFn: () => ShiftRoutingService.getSettings(),
		refetchOnMount: "always",
	});
}

export function useShiftRoutingSettingsSuspense() {
	return useSuspenseQuery({
		queryKey: shiftRoutingKeys.settings(),
		queryFn: () => ShiftRoutingService.getSettings(),
		refetchOnMount: "always",
	});
}

export function useUpdateRoutingSettings() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateRoutingSettingsInput) =>
			ShiftRoutingService.updateSettings(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: shiftRoutingKeys.settings(),
			});
		},
	});
}

export function useSyncTiers() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: SyncTiersPayload) =>
			ShiftRoutingService.syncTiers(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: shiftRoutingKeys.settings(),
			});
		},
	});
}

export function usePatchTier() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			tierId,
			patch,
		}: {
			tierId: string;
			patch: { isActive?: boolean };
		}) => ShiftRoutingService.patchTier(tierId, patch),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: shiftRoutingKeys.settings(),
			});
		},
	});
}
