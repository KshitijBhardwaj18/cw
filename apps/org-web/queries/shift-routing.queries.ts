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
	settings: (orgId: string) =>
		[...shiftRoutingKeys.all, "settings", orgId] as const,
};

export function useShiftRoutingSettings(orgId: string) {
	return useQuery({
		queryKey: shiftRoutingKeys.settings(orgId),
		queryFn: () => ShiftRoutingService.getSettings(),
		enabled: !!orgId,
		refetchOnMount: "always",
	});
}

export function useShiftRoutingSettingsSuspense(orgId: string) {
	return useSuspenseQuery({
		queryKey: shiftRoutingKeys.settings(orgId),
		queryFn: () => ShiftRoutingService.getSettings(),
		refetchOnMount: "always",
	});
}

export function useUpdateRoutingSettings(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateRoutingSettingsInput) =>
			ShiftRoutingService.updateSettings(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: shiftRoutingKeys.settings(orgId),
			});
		},
	});
}

export function useSyncTiers(orgId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: SyncTiersPayload) =>
			ShiftRoutingService.syncTiers(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: shiftRoutingKeys.settings(orgId),
			});
		},
	});
}

export function usePatchTier(orgId: string) {
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
				queryKey: shiftRoutingKeys.settings(orgId),
			});
		},
	});
}
