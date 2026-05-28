import { Injectable, NotFoundException } from "@nestjs/common";
import { PlacementStatus } from "@repo/db";
import { isInternalWorkforceType } from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";
import { PLACEMENT_TAB_STATUS } from "../placements.constants";
import { formatLongDate } from "../placements-formatters";
import type { PlacementListRow } from "../placements-list.include";
import { PlacementComplianceService } from "./placement-compliance.service";
import { PlacementsService } from "./placements.service";

export type CandidatePortalListItem = {
	id: string;
	kind: "active" | "upcoming" | "past";
	jobTitle: string;
	employerName: string;
	locationLabel: string;
	/** @deprecated Prefer {@link startDate} / {@link endDate} with client TZ formatters */
	dateLabel: string;
	/** Assignment start instant (ISO); null when unknown */
	startDate: string | null;
	/** Assignment end instant (ISO); null when unknown */
	endDate: string | null;
	shiftLabel?: string;
	onboardingPercent?: number;
};

@Injectable()
export class CandidatePlacementsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly placementsService: PlacementsService,
		private readonly placementComplianceService: PlacementComplianceService,
	) {}

	private async requireCandidateOwnsPlacement(
		userId: string,
		orgId: string,
		placementId: string,
	): Promise<void> {
		const ok = await this.prisma.placement.findFirst({
			where: {
				id: placementId,
				organizationId: orgId,
				candidate: { userId },
			},
			select: { id: true },
		});
		if (!ok) {
			throw new NotFoundException("Placement not found.");
		}
	}

	private candidateKindFromStatus(
		status: PlacementStatus,
	): "active" | "upcoming" | "past" {
		if (PLACEMENT_TAB_STATUS.active.includes(status)) return "active";
		if (PLACEMENT_TAB_STATUS.upcoming.includes(status)) return "upcoming";
		return "past";
	}

	private mapCandidatePortalListItem(
		p: {
			id: string;
			status: PlacementStatus;
			jobTitle: string | null;
			startDate: Date | null;
			endDate: Date | null;
			shiftType: unknown;
			shiftSchedule: string[];
			submission: {
				requisition: {
					jobTitle: string | null;
					jobSummary: string | null;
				} | null;
			};
			location: { name: string | null } | null;
			organization: { name: string };
		},
		compliancePercent: number,
		hasComplianceRequirements: boolean,
	): CandidatePortalListItem {
		const jobTitle =
			p.jobTitle ??
			p.submission.requisition?.jobTitle ??
			p.submission.requisition?.jobSummary ??
			"Assignment";
		const kind = this.candidateKindFromStatus(p.status);
		const shiftScheduleStr =
			p.shiftSchedule?.length > 0 ? p.shiftSchedule.join(", ") : "—";
		const shiftLabel =
			p.shiftType != null ? String(p.shiftType) : shiftScheduleStr;

		let dateLabel: string;
		if (kind === "upcoming") {
			dateLabel = p.startDate ? `Starts ${formatLongDate(p.startDate)}` : "—";
		} else {
			const start = formatLongDate(p.startDate);
			const end = formatLongDate(p.endDate);
			dateLabel = start !== "—" && end !== "—" ? `${start} - ${end}` : start;
		}

		const base: CandidatePortalListItem = {
			id: p.id,
			kind,
			jobTitle,
			employerName: p.organization.name,
			locationLabel: p.location?.name ?? "—",
			dateLabel,
			startDate: p.startDate?.toISOString() ?? null,
			endDate: p.endDate?.toISOString() ?? null,
		};

		if (kind === "upcoming") {
			// Banner is meant to nudge the candidate to finish required docs.
			// Suppress it when there's nothing to nudge: no requirements
			// configured for the placement, or candidate is already 100% compliant.
			const showOnboardingBanner =
				hasComplianceRequirements && compliancePercent < 100;
			return showOnboardingBanner
				? { ...base, onboardingPercent: compliancePercent }
				: base;
		}
		if (kind === "active") {
			return { ...base, shiftLabel };
		}
		return base;
	}

	async listCandidatePlacements(
		userId: string,
		orgId: string,
	): Promise<{
		active: CandidatePortalListItem[];
		upcoming: CandidatePortalListItem[];
		past: CandidatePortalListItem[];
		isInternal: boolean;
	}> {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true, workforceType: true },
		});
		if (!candidate) {
			return { active: [], upcoming: [], past: [], isInternal: false };
		}

		const rows = await this.prisma.placement.findMany({
			where: { organizationId: orgId, candidateId: candidate.id },
			include: {
				submission: {
					select: {
						requisition: { select: { jobTitle: true, jobSummary: true } },
					},
				},
				location: { select: { name: true } },
				organization: { select: { name: true } },
			},
			orderBy: { createdAt: "desc" },
		});

		const placementIds = rows.map((r) => r.id);
		const fetchRequirementCounts =
			placementIds.length === 0
				? Promise.resolve(
						[] as Array<{ placementId: string; _count: { _all: number } }>,
					)
				: this.prisma.placementComplianceItem.groupBy({
						by: ["placementId"],
						where: { placementId: { in: placementIds }, removedAt: null },
						_count: { _all: true },
					});
		const [percentMap, requirementCounts] = await Promise.all([
			this.placementComplianceService.batchCompliancePercents(
				rows as unknown as PlacementListRow[],
			),
			fetchRequirementCounts,
		]);
		const requirementCountByPlacement = new Map<string, number>(
			requirementCounts.map((row) => [row.placementId, row._count._all]),
		);

		const active: CandidatePortalListItem[] = [];
		const upcoming: CandidatePortalListItem[] = [];
		const past: CandidatePortalListItem[] = [];

		for (const r of rows) {
			const pct = percentMap.get(r.id) ?? 0;
			const hasRequirements = (requirementCountByPlacement.get(r.id) ?? 0) > 0;
			const item = this.mapCandidatePortalListItem(r, pct, hasRequirements);
			if (PLACEMENT_TAB_STATUS.active.includes(r.status)) {
				active.push(item);
			} else if (PLACEMENT_TAB_STATUS.upcoming.includes(r.status)) {
				upcoming.push(item);
			} else if (PLACEMENT_TAB_STATUS.completed.includes(r.status)) {
				past.push(item);
			}
		}

		return {
			active,
			upcoming,
			past,
			isInternal: isInternalWorkforceType(candidate.workforceType),
		};
	}

	async countCandidatePlacements(
		userId: string,
		orgId: string,
	): Promise<{ active: number; upcoming: number; past: number }> {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true },
		});
		if (!candidate) {
			return { active: 0, upcoming: 0, past: 0 };
		}

		const baseWhere = { organizationId: orgId, candidateId: candidate.id };

		const [active, upcoming, past] = await Promise.all([
			this.prisma.placement.count({
				where: { ...baseWhere, status: { in: PLACEMENT_TAB_STATUS.active } },
			}),
			this.prisma.placement.count({
				where: { ...baseWhere, status: { in: PLACEMENT_TAB_STATUS.upcoming } },
			}),
			this.prisma.placement.count({
				where: {
					...baseWhere,
					status: { in: PLACEMENT_TAB_STATUS.completed },
				},
			}),
		]);

		return { active, upcoming, past };
	}

	async getCandidatePlacementDetail(
		userId: string,
		orgId: string,
		placementId: string,
	) {
		await this.requireCandidateOwnsPlacement(userId, orgId, placementId);
		const d = await this.placementsService.getDetail(orgId, placementId);
		const p = await this.prisma.placement.findFirst({
			where: { id: placementId, organizationId: orgId },
			include: {
				organization: { select: { name: true } },
				summary: {
					select: {
						complianceProgressCompleted: true,
						complianceProgressTotal: true,
					},
				},
			},
		});
		if (!p) throw new NotFoundException("Placement not found.");

		const kind = this.candidateKindFromStatus(p.status);

		const statusLabel =
			kind === "active"
				? "Active"
				: kind === "upcoming"
					? "Upcoming"
					: p.status === PlacementStatus.COMPLETED
						? "Completed"
						: p.status === PlacementStatus.TERMINATED
							? "Terminated"
							: String(p.status);

		const shiftSchedule =
			p.shiftSchedule?.length > 0 ? p.shiftSchedule.join(", ") : "—";
		const shiftLabel =
			p.shiftType != null ? String(p.shiftType) : shiftSchedule;

		const dateRangeLabel = `${d.startDate} - ${d.endDate}`;

		return {
			id: p.id,
			kind,
			jobTitle: d.jobTitle,
			facilityName: p.organization.name,
			statusLabel,
			locationLabel: d.location,
			shiftLabel,
			dateRangeLabel,
			summary: {
				startDate: d.startDate,
				endDate: d.endDate,
				payRate: d.payRate ?? "—",
			},
			requisition: {
				jobTitle: d.jobTitle,
				unitDepartment: d.departmentUnit,
				payRate: d.payRate ?? "—",
				shiftDetails: d.shiftSchedule,
				shiftType: d.shiftType,
				location: d.location,
			},
			candidate: {
				name: d.candidateName,
				occupation: d.occupation,
				specialty: d.specialty,
				typeLabel: d.vendor ? "Agency" : "Internal",
			},
			onboardingItems: [
				{ label: "Offer accepted", complete: !!p.acceptedAt },
				{
					label: "Compliance complete",
					complete: (() => {
						const total = p.summary?.complianceProgressTotal ?? 0;
						const done = p.summary?.complianceProgressCompleted ?? 0;
						if (total === 0) return true;
						return done >= total;
					})(),
				},
				{
					label: "Assignment active",
					complete:
						p.status === PlacementStatus.ACTIVE ||
						p.status === PlacementStatus.ON_HOLD ||
						p.status === PlacementStatus.COMPLETED,
				},
			],
		};
	}

	async getCandidatePlacementOfferHistory(
		userId: string,
		orgId: string,
		placementId: string,
	) {
		await this.requireCandidateOwnsPlacement(userId, orgId, placementId);
		return this.placementsService.getOfferHistory(orgId, placementId);
	}

	async getCandidatePlacementCompliance(
		userId: string,
		orgId: string,
		placementId: string,
	) {
		await this.requireCandidateOwnsPlacement(userId, orgId, placementId);
		return this.placementComplianceService.getPlacementCompliance(
			orgId,
			placementId,
			"candidate",
		);
	}
}
