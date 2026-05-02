import type { ShiftRoutingResponse, SyncTiersPayload } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

export type UpdateRoutingSettingsInput = {
	enableRoutingDelay: boolean;
	delayDuration: number;
	delayUnit: string;
};

const BASE = "/api/org/shift-routing";

export class ShiftRoutingService {
	static async getSettings() {
		return ApiClient.get<ShiftRoutingResponse>(BASE);
	}

	static async updateSettings(input: UpdateRoutingSettingsInput) {
		return ApiClient.patch<ShiftRoutingResponse>(`${BASE}/delay`, input);
	}

	static async syncTiers(payload: SyncTiersPayload) {
		return ApiClient.put<ShiftRoutingResponse>(`${BASE}/tiers`, payload);
	}

	static async patchTier(tierId: string, patch: { isActive?: boolean }) {
		return ApiClient.patch<ShiftRoutingResponse>(
			`${BASE}/tiers/${tierId}`,
			patch,
		);
	}
}
