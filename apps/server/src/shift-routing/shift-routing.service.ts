import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { PatchTierDto } from "./dto/patch-tier.dto";
import type { SyncTiersDto } from "./dto/sync-tiers.dto";
import type { UpdateRoutingSettingsDto } from "./dto/update-routing-settings.dto";

const SETTINGS_SELECT = {
	id: true,
	organizationId: true,
	enableRoutingDelay: true,
	delayDuration: true,
	delayUnit: true,
	updatedAt: true,
} as const;

const TIER_SELECT = {
	id: true,
	organizationId: true,
	workforceType: true,
	priorityOrder: true,
	isActive: true,
	updatedAt: true,
} as const;

@Injectable()
export class ShiftRoutingService {
	constructor(private readonly prisma: PrismaService) {}

	async getSettings(orgId: string) {
		const [settings, tiers] = await Promise.all([
			this.prisma.shiftRoutingSettings.findUnique({
				where: { organizationId: orgId },
				select: SETTINGS_SELECT,
			}),
			this.prisma.shiftRoutingTier.findMany({
				where: { organizationId: orgId },
				select: TIER_SELECT,
				orderBy: { priorityOrder: "asc" },
			}),
		]);

		return { settings, tiers };
	}

	async updateSettings(orgId: string, dto: UpdateRoutingSettingsDto) {
		return this.prisma.shiftRoutingSettings.upsert({
			where: { organizationId: orgId },
			create: {
				organizationId: orgId,
				enableRoutingDelay: dto.enableRoutingDelay,
				delayDuration: dto.delayDuration,
				delayUnit: dto.delayUnit,
			},
			update: {
				enableRoutingDelay: dto.enableRoutingDelay,
				delayDuration: dto.delayDuration,
				delayUnit: dto.delayUnit,
			},
			select: SETTINGS_SELECT,
		});
	}

	async syncTiers(orgId: string, dto: SyncTiersDto) {
		const tiers = dto.tiers;

		await this.prisma.$transaction(
			tiers.map((tier) =>
				this.prisma.shiftRoutingTier.upsert({
					where: {
						organizationId_workforceType: {
							organizationId: orgId,
							workforceType: tier.workforceType,
						},
					},
					create: {
						organizationId: orgId,
						workforceType: tier.workforceType,
						priorityOrder: tier.priorityOrder,
						isActive: tier.isActive,
					},
					update: {
						priorityOrder: tier.priorityOrder,
						isActive: tier.isActive,
					},
				}),
			),
		);

		return this.prisma.shiftRoutingTier.findMany({
			where: { organizationId: orgId },
			select: TIER_SELECT,
			orderBy: { priorityOrder: "asc" },
		});
	}

	async patchTier(orgId: string, tierId: string, dto: PatchTierDto) {
		return this.prisma.shiftRoutingTier.update({
			where: { id: tierId, organizationId: orgId },
			data: {
				...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
			},
			select: TIER_SELECT,
		});
	}
}
