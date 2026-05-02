import { Injectable, NotFoundException } from "@nestjs/common";
import { PlacementStatus } from "@repo/db";
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
	dateLabel: string;
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
			throw new NotFoundException("Placement not found");
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
	): {
		id: string;
		kind: "active" | "upcoming" | "past";
		jobTitle: string;
		employerName: string;
		locationLabel: string;
		dateLabel: string;
		shiftLabel?: string;
		onboardingPercent?: number;
	} {
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

		const base = {
			id: p.id,
			kind,
			jobTitle,
			employerName: p.organization.name,
			locationLabel: p.location?.name ?? "—",
			dateLabel,
		};

		if (kind === "upcoming") {
			return { ...base, onboardingPercent: compliancePercent };
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
	}> {
		const candidate = await this.prisma.candidate.findFirst({
			where: { userId, organizationId: orgId },
			select: { id: true },
		});
		if (!candidate) {
			return { active: [], upcoming: [], past: [] };
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

		const percentMap =
			await this.placementComplianceService.batchCompliancePercents(
				rows as unknown as PlacementListRow[],
			);

		const active: CandidatePortalListItem[] = [];
		const upcoming: CandidatePortalListItem[] = [];
		const past: CandidatePortalListItem[] = [];

		for (const r of rows) {
			const pct = percentMap.get(r.id) ?? 0;
			const item = this.mapCandidatePortalListItem(r, pct);
			if (PLACEMENT_TAB_STATUS.active.includes(r.status)) {
				active.push(item);
			} else if (PLACEMENT_TAB_STATUS.upcoming.includes(r.status)) {
				upcoming.push(item);
			} else if (PLACEMENT_TAB_STATUS.completed.includes(r.status)) {
				past.push(item);
			}
		}

		return { active, upcoming, past };
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
				where: { ...baseWhere, status: { in: PLACEMENT_TAB_STATUS.completed } },
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
		if (!p) throw new NotFoundException("Placement not found");

		const kind = this.candidateKindFromStatus(p.status);

		const statusLabel =
			p.status === PlacementStatus.ACTIVE ||
			p.status === PlacementStatus.ENDING_SOON
				? "Active"
				: PLACEMENT_TAB_STATUS.upcoming.includes(p.status)
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
					complete:
						(p.summary?.complianceProgressTotal ?? 0) > 0 &&
						(p.summary?.complianceProgressCompleted ?? 0) >=
							(p.summary?.complianceProgressTotal ?? 0),
				},
				{
					label: "Assignment active",
					complete:
						p.status === PlacementStatus.ACTIVE ||
						p.status === PlacementStatus.ENDING_SOON,
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
		);
	}
}
