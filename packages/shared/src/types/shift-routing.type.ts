import type { Prisma } from "@repo/db";

export type ShiftRoutingSettingsType = Prisma.ShiftRoutingSettingsGetPayload<{
	select: {
		id: true;
		organizationId: true;
		enableRoutingDelay: true;
		delayDuration: true;
		delayUnit: true;
		updatedAt: true;
	};
}>;

export type ShiftRoutingTierType = Prisma.ShiftRoutingTierGetPayload<{
	select: {
		id: true;
		organizationId: true;
		workforceType: true;
		priorityOrder: true;
		isActive: true;
		updatedAt: true;
	};
}>;

export interface ShiftRoutingResponse {
	settings: ShiftRoutingSettingsType;
	tiers: ShiftRoutingTierType[];
}

export interface SyncTiersPayload {
	tiers: Array<{
		workforceType: string;
		priorityOrder: number;
		isActive: boolean;
	}>;
}
