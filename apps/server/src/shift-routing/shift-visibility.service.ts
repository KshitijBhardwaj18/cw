import { Injectable } from "@nestjs/common";
import {
	type CandidateWorkforceType,
	type DelayUnit,
	Prisma,
	UserRole,
} from "@repo/db";
import { EXTERNAL_WORKFORCE_TYPES, isAdminPortalRole } from "@repo/shared";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { PrismaService } from "src/prisma/prisma.service";

export const VENDOR_USER_WORKFORCE_TYPES =
	EXTERNAL_WORKFORCE_TYPES as readonly CandidateWorkforceType[];

type RoutingTier = {
	workforceType: CandidateWorkforceType;
	priorityOrder: number;
	isActive: boolean;
};

type RoutingSettings = {
	enableRoutingDelay: boolean;
	delayDuration: number;
	delayUnit: DelayUnit;
};

export type OrgRoutingConfig = {
	settings: RoutingSettings | null;
	tiers: RoutingTier[];
};

export type ViewerVisibilityContext =
	| { kind: "bypass" }
	| { kind: "candidate"; workforceType: CandidateWorkforceType | null }
	| { kind: "vendor"; workforceTypes: readonly CandidateWorkforceType[] };

@Injectable()
export class ShiftVisibilityService {
	constructor(private readonly prisma: PrismaService) {}

	async resolveOrgRoutingConfig(orgId: string): Promise<OrgRoutingConfig> {
		const [settings, tiers] = await Promise.all([
			this.prisma.shiftRoutingSettings.findUnique({
				where: { organizationId: orgId },
				select: {
					enableRoutingDelay: true,
					delayDuration: true,
					delayUnit: true,
				},
			}),
			this.prisma.shiftRoutingTier.findMany({
				where: { organizationId: orgId, isActive: true },
				select: {
					workforceType: true,
					priorityOrder: true,
					isActive: true,
				},
				orderBy: { priorityOrder: "asc" },
			}),
		]);
		return { settings, tiers };
	}

	async resolveViewerVisibilityContext(
		session: UserSession,
		orgId: string,
	): Promise<ViewerVisibilityContext> {
		const roleRaw = session.user.role;
		const role = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw;

		if (role === UserRole.ORGANIZATION_USER || isAdminPortalRole(role)) {
			return { kind: "bypass" };
		}

		if (role === UserRole.VENDOR_USER) {
			return { kind: "vendor", workforceTypes: VENDOR_USER_WORKFORCE_TYPES };
		}

		if (role === UserRole.CANDIDATE_USER) {
			const candidate = await this.prisma.candidate.findFirst({
				where: { userId: session.user.id, organizationId: orgId },
				select: { workforceType: true },
			});
			return {
				kind: "candidate",
				workforceType: candidate?.workforceType ?? null,
			};
		}

		return { kind: "vendor", workforceTypes: [] };
	}

	private toHours(duration: number, unit: DelayUnit): number {
		if (unit === "MINUTES") return duration / 60;
		if (unit === "DAYS") return duration * 24;
		return duration;
	}

	effectiveUnlockHoursForShift(
		template: {
			limitShiftVisibility: boolean;
			visibilityUnlockDuration: number | null;
			visibilityUnlockUnit: DelayUnit | null;
		} | null,
		settings: RoutingSettings | null,
	): number {
		if (
			template?.limitShiftVisibility &&
			template.visibilityUnlockDuration != null &&
			template.visibilityUnlockDuration > 0 &&
			template.visibilityUnlockUnit != null
		) {
			return this.toHours(
				template.visibilityUnlockDuration,
				template.visibilityUnlockUnit,
			);
		}
		if (settings == null) return 0;
		return this.toHours(settings.delayDuration, settings.delayUnit);
	}

	private minTierOffset(
		tiers: RoutingTier[],
		eligibleTypes: readonly CandidateWorkforceType[],
	): number | null {
		const eligible = new Set<string>(eligibleTypes);
		let min: number | null = null;
		for (const t of tiers) {
			if (!t.isActive) continue;
			if (!eligible.has(t.workforceType)) continue;
			if (min == null || t.priorityOrder < min) min = t.priorityOrder;
		}
		return min;
	}

	tierOffsetForViewer(
		viewer: ViewerVisibilityContext,
		tiers: RoutingTier[],
	): number | null {
		if (viewer.kind === "bypass") return 0;
		if (viewer.kind === "candidate") {
			if (!viewer.workforceType) return null;
			return this.minTierOffset(tiers, [viewer.workforceType]);
		}
		return this.minTierOffset(tiers, viewer.workforceTypes);
	}

	visibleAtForOffset(
		publishedAt: Date | null,
		tierOffset: number,
		unlockHours: number,
	): Date | null {
		if (!publishedAt) return null;
		if (tierOffset <= 0 || unlockHours <= 0) return publishedAt;
		const ms = tierOffset * unlockHours * 60 * 60 * 1000;
		return new Date(publishedAt.getTime() + ms);
	}

	async buildShiftVisibilityWhere(
		orgId: string,
		viewer: ViewerVisibilityContext,
		now: Date = new Date(),
	): Promise<Prisma.PerDiemShiftWhereInput> {
		if (viewer.kind === "bypass") return {};

		const { settings, tiers } = await this.resolveOrgRoutingConfig(orgId);

		if (!settings?.enableRoutingDelay) {
			return { publishedAt: { lte: now } };
		}

		const offset = this.tierOffsetForViewer(viewer, tiers);
		if (offset == null) {
			return { id: { in: [] } };
		}

		const orgUnlockHours = this.toHours(
			settings.delayDuration,
			settings.delayUnit,
		);
		const orgCutoff = this.cutoffFor(now, offset, orgUnlockHours);

		const templates = await this.prisma.shiftTemplate.findMany({
			where: {
				organizationId: orgId,
				limitShiftVisibility: true,
				visibilityUnlockDuration: { gt: 0 },
				visibilityUnlockUnit: { not: null },
			},
			select: {
				id: true,
				visibilityUnlockDuration: true,
				visibilityUnlockUnit: true,
			},
		});

		const byHours = new Map<number, string[]>();
		for (const tpl of templates) {
			if (
				tpl.visibilityUnlockDuration == null ||
				tpl.visibilityUnlockUnit == null
			)
				continue;
			const hours = this.toHours(
				tpl.visibilityUnlockDuration,
				tpl.visibilityUnlockUnit,
			);
			const arr = byHours.get(hours) ?? [];
			arr.push(tpl.id);
			byHours.set(hours, arr);
		}

		const branches: Prisma.PerDiemShiftWhereInput[] = [
			{
				AND: [
					{ publishedAt: { lte: orgCutoff, not: null } },
					{
						OR: [
							{ shiftTemplateId: null },
							{
								shiftTemplate: {
									OR: [
										{ limitShiftVisibility: false },
										{ visibilityUnlockDuration: null },
										{ visibilityUnlockDuration: { lte: 0 } },
										{ visibilityUnlockUnit: null },
									],
								},
							},
						],
					},
				],
			},
		];

		for (const [hours, templateIds] of byHours) {
			const cutoff = this.cutoffFor(now, offset, hours);
			branches.push({
				shiftTemplateId: { in: templateIds },
				publishedAt: { lte: cutoff, not: null },
			});
		}

		return { OR: branches };
	}

	private cutoffFor(now: Date, offset: number, unlockHours: number): Date {
		if (offset <= 0 || unlockHours <= 0) return now;
		return new Date(now.getTime() - offset * unlockHours * 60 * 60 * 1000);
	}

	canViewerSeeShift(
		viewer: ViewerVisibilityContext,
		shift: {
			publishedAt: Date | null;
			shiftTemplate: {
				limitShiftVisibility: boolean;
				visibilityUnlockDuration: number | null;
				visibilityUnlockUnit: DelayUnit | null;
			} | null;
		},
		config: OrgRoutingConfig,
		now: Date = new Date(),
	): boolean {
		if (viewer.kind === "bypass") return true;
		if (!shift.publishedAt) return false;

		const settings = config.settings;
		if (!settings?.enableRoutingDelay) {
			return shift.publishedAt <= now;
		}

		const offset = this.tierOffsetForViewer(viewer, config.tiers);
		if (offset == null) return false;

		const unlockHours = this.effectiveUnlockHoursForShift(
			shift.shiftTemplate,
			settings,
		);
		const visibleAt = this.visibleAtForOffset(
			shift.publishedAt,
			offset,
			unlockHours,
		);
		return visibleAt != null && visibleAt <= now;
	}

	static readonly EXTERNAL_WORKFORCE_TYPES = EXTERNAL_WORKFORCE_TYPES;
}
