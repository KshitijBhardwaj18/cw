import { BadRequestException, Injectable } from "@nestjs/common";
import { CandidateComplianceStatus, type Prisma } from "@repo/db";
import type { PagePaginatedResponse } from "@repo/shared";
import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { PLACEMENT_TAB_STATUS } from "src/placements/placements.constants";
import { formatShortDate } from "src/placements/placements-formatters";
import { PlacementComplianceService } from "src/placements/services/placement-compliance.service";
import { PrismaService } from "src/prisma/prisma.service";
import type {
	QueryVendorOnboardingDto,
	VendorOnboardingWeekBucketParam,
} from "../dto/query-vendor-onboarding.dto";
import type {
	VendorOnboardingCardDto,
	VendorOnboardingDocumentDto,
	VendorOnboardingMetricsDto,
} from "../dto/vendor-onboarding-response.dto";

const ONBOARDING_WINDOW_DAYS = 21;

type OnboardingUiStatus = "Cleared" | "In-Progress" | "Behind Schedule";

type DocUiStatus = VendorOnboardingDocumentDto["status"];

@Injectable()
export class VendorOnboardingService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly placementComplianceService: PlacementComplianceService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

	private windowEnd(today: Date): Date {
		return addDays(today, ONBOARDING_WINDOW_DAYS);
	}

	private parseWeekBucket(
		wb: QueryVendorOnboardingDto["weekBucket"] | undefined,
	): 1 | 2 | 3 | "all" {
		if (!wb || wb === "all") return "all";
		if (wb === "1") return 1;
		if (wb === "2") return 2;
		return 3;
	}

	private startDateFilterForWeekBucket(
		today: Date,
		weekBucket: 1 | 2 | 3 | "all",
	): Prisma.DateTimeNullableFilter {
		const end = this.windowEnd(today);
		if (weekBucket === 1) {
			return { gte: today, lte: addDays(today, 7) };
		}
		if (weekBucket === 2) {
			return { gt: addDays(today, 7), lte: addDays(today, 14) };
		}
		if (weekBucket === 3) {
			return { gt: addDays(today, 14), lte: end };
		}
		return { gte: today, lte: end };
	}

	private weekBucketFromStartDate(start: Date, today: Date): 1 | 2 | 3 {
		const d = differenceInCalendarDays(startOfDay(start), today);
		if (d <= 7) return 1;
		if (d <= 14) return 2;
		return 3;
	}

	private deriveOnboardingStatus(
		progressPct: number,
		daysUntilStart: number,
	): OnboardingUiStatus {
		if (progressPct >= 100) return "Cleared";
		if (daysUntilStart <= 5 && progressPct < 100) return "Behind Schedule";
		return "In-Progress";
	}

	private initialsFromName(name: string | null | undefined): string {
		const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
		if (parts.length === 0) return "?";
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}

	private searchWhere(
		search: string | undefined,
	): Prisma.PlacementWhereInput | undefined {
		const q = search?.trim();
		if (!q) return undefined;
		return {
			OR: [
				{ jobTitle: { contains: q, mode: "insensitive" } },
				{
					candidate: {
						user: {
							OR: [
								{ name: { contains: q, mode: "insensitive" } },
								{ email: { contains: q, mode: "insensitive" } },
							],
						},
					},
				},
			],
		};
	}

	private basePlacementWhere(
		organizationId: string,
		vendorId: string,
		today: Date,
		weekBucket: 1 | 2 | 3 | "all",
		search: string | undefined,
	): Prisma.PlacementWhereInput {
		return {
			organizationId,
			status: { in: PLACEMENT_TAB_STATUS.upcoming },
			startDate: {
				not: null,
				...this.startDateFilterForWeekBucket(today, weekBucket),
			},
			candidate: { vendorId },
			...(this.searchWhere(search) ?? {}),
		};
	}

	private mapDocStatus(
		cc: {
			status: CandidateComplianceStatus;
			documentUrl: string | null;
			expiryDate: Date | null;
			uploadedAt: Date | null;
		} | null,
		now: Date,
	): DocUiStatus {
		if (!cc?.documentUrl) return "missing";
		if (cc.expiryDate && cc.expiryDate < now) return "missing";
		if (cc.status === CandidateComplianceStatus.EXPIRED) return "missing";
		if (cc.status === CandidateComplianceStatus.APPROVED) return "complete";
		if (cc.status === CandidateComplianceStatus.PENDING) return "pending";
		return "pending";
	}

	private async batchDocumentRowsForPlacements(
		placements: Array<{
			id: string;
			candidateId: string;
			startDate: Date | null;
		}>,
	): Promise<Map<string, VendorOnboardingDocumentDto[]>> {
		const out = new Map<string, VendorOnboardingDocumentDto[]>();
		if (placements.length === 0) return out;

		const placementIds = placements.map((p) => p.id);
		const pciRows = await this.prisma.placementComplianceItem.findMany({
			where: { placementId: { in: placementIds }, removedAt: null },
			include: { complianceListItem: true },
		});

		const candidateIds = [...new Set(placements.map((p) => p.candidateId))];
		const itemIds = [...new Set(pciRows.map((r) => r.complianceListItemId))];

		const ccRows =
			itemIds.length > 0
				? await this.prisma.candidateCompliance.findMany({
						where: {
							candidateId: { in: candidateIds },
							complianceListItemId: { in: itemIds },
						},
					})
				: [];

		const ccKey = (candId: string, itemId: string) => `${candId}:${itemId}`;
		const ccByKey = new Map(
			ccRows.map((r) => [ccKey(r.candidateId, r.complianceListItemId), r]),
		);

		const byPlacement = new Map<string, typeof pciRows>();
		for (const row of pciRows) {
			const arr = byPlacement.get(row.placementId) ?? [];
			arr.push(row);
			byPlacement.set(row.placementId, arr);
		}

		const now = new Date();

		for (const p of placements) {
			const rows = byPlacement.get(p.id) ?? [];
			const docs: VendorOnboardingDocumentDto[] = [];
			const due = p.startDate ? formatShortDate(p.startDate) : "—";

			for (const pci of rows) {
				const li = pci.complianceListItem;
				const cc = ccByKey.get(ccKey(p.candidateId, li.id)) ?? null;
				const status = this.mapDocStatus(cc, now);
				const uploadedDate =
					cc?.uploadedAt != null ? formatShortDate(cc.uploadedAt) : undefined;
				docs.push({
					name: li.name,
					uploadedDate,
					dueDate: status === "complete" ? undefined : due,
					status,
				});
			}
			docs.sort((a, b) => a.name.localeCompare(b.name));
			out.set(p.id, docs);
		}

		return out;
	}

	async getMetrics(
		organizationId: string,
		vendorId: string,
	): Promise<VendorOnboardingMetricsDto> {
		const today = startOfDay(new Date());
		const windowEnd = this.windowEnd(today);
		const agg =
			await this.placementComplianceService.aggregateVendorOnboardingMetrics({
				organizationId,
				vendorId,
				windowStart: today,
				windowEnd,
			});
		return {
			...agg,
			windowDays: ONBOARDING_WINDOW_DAYS,
		};
	}

	async listTracker(
		organizationId: string,
		vendorId: string,
		query: QueryVendorOnboardingDto,
	): Promise<
		PagePaginatedResponse<VendorOnboardingCardDto> & {
			weekBucket: VendorOnboardingWeekBucketParam;
			weekLabel: string;
			weekDescription: string;
		}
	> {
		const today = startOfDay(new Date());
		const weekBucketParam: VendorOnboardingWeekBucketParam =
			query.weekBucket ?? "all";
		const wb = this.parseWeekBucket(query.weekBucket);
		const page = query.page ?? 1;
		const limit = query.limit ?? 10;
		const skip = (page - 1) * limit;

		const where = this.basePlacementWhere(
			organizationId,
			vendorId,
			today,
			wb,
			query.search,
		);

		const total = await this.prisma.placement.count({ where });

		if (total === 0) {
			return {
				data: [],
				total: 0,
				page,
				limit,
				totalPages: 1,
				weekBucket: weekBucketParam,
				weekLabel: this.weekLabel(wb),
				weekDescription: this.weekDescription(wb, 0),
			};
		}

		const placements = await this.prisma.placement.findMany({
			where,
			select: {
				id: true,
				candidateId: true,
				jobTitle: true,
				startDate: true,
				summary: {
					select: {
						complianceProgressCompleted: true,
						complianceProgressTotal: true,
					},
				},
				candidate: {
					select: {
						user: { select: { name: true, email: true } },
					},
				},
				submission: {
					select: {
						requisition: { select: { jobTitle: true, jobSummary: true } },
					},
				},
				location: { select: { name: true } },
			},
			orderBy: [{ startDate: "asc" }, { id: "asc" }],
			skip,
			take: limit,
		});

		const docMap = await this.batchDocumentRowsForPlacements(
			placements.map((p) => ({
				id: p.id,
				candidateId: p.candidateId,
				startDate: p.startDate,
			})),
		);

		const data: VendorOnboardingCardDto[] = placements.flatMap((p) => {
			const start = p.startDate;
			if (!start) {
				return [];
			}
			const daysRemaining = Math.max(
				0,
				differenceInCalendarDays(startOfDay(start), today),
			);
			const completed = p.summary?.complianceProgressCompleted ?? 0;
			const totalDocs = p.summary?.complianceProgressTotal ?? 0;
			const pct =
				totalDocs > 0 ? Math.round((completed / totalDocs) * 100) : 100;
			const status = this.deriveOnboardingStatus(pct, daysRemaining);
			const userName = p.candidate.user.name?.trim() || "—";
			const role =
				p.jobTitle?.trim() ||
				p.submission.requisition?.jobTitle?.trim() ||
				p.submission.requisition?.jobSummary?.trim() ||
				"Assignment";
			const detailedDocuments = docMap.get(p.id) ?? [];

			return [
				{
					id: p.id,
					candidateId: p.candidateId,
					name: userName,
					initials: this.initialsFromName(p.candidate.user.name),
					role,
					startDate: formatShortDate(start),
					daysRemaining,
					location: p.location?.name ?? "—",
					status,
					progress: pct,
					documentsCompleted: completed,
					totalDocuments: totalDocs,
					dueDate: formatShortDate(start),
					detailedDocuments,
					weekBucket: this.weekBucketFromStartDate(start, today),
				},
			];
		});

		const totalPages = Math.ceil(total / limit) || 1;

		return {
			data,
			total,
			page,
			limit,
			totalPages,
			weekBucket: weekBucketParam,
			weekLabel: this.weekLabel(wb),
			weekDescription: this.weekDescription(wb, total),
		};
	}

	private weekLabel(weekBucket: 1 | 2 | 3 | "all"): string {
		if (weekBucket === 1) return "Week 1";
		if (weekBucket === 2) return "Week 2";
		if (weekBucket === 3) return "Week 3";
		return "All upcoming (21 days)";
	}

	private weekDescription(
		weekBucket: 1 | 2 | 3 | "all",
		total: number,
	): string {
		if (weekBucket === 1) {
			return `Starting in 0–7 days (${total} placement${total === 1 ? "" : "s"})`;
		}
		if (weekBucket === 2) {
			return `Starting in 8–14 days (${total} placement${total === 1 ? "" : "s"})`;
		}
		if (weekBucket === 3) {
			return `Starting in 15–21 days (${total} placement${total === 1 ? "" : "s"})`;
		}
		return `Next ${ONBOARDING_WINDOW_DAYS} days (${total} placement${total === 1 ? "" : "s"})`;
	}

	async queueReminderEmail(
		organizationId: string,
		vendorId: string,
		placementId: string,
	): Promise<{ queued: true; placementCount: number }> {
		const today = startOfDay(new Date());
		const baseWhere = this.basePlacementWhere(
			organizationId,
			vendorId,
			today,
			"all",
			undefined,
		);

		const placement = await this.prisma.placement.findFirst({
			where: { ...baseWhere, id: placementId },
			select: { id: true },
		});
		if (!placement) {
			throw new BadRequestException(
				"This placement is not in your onboarding window or is not eligible for a reminder.",
			);
		}
		await this.backgroundJobs.enqueueVendorOnboardingReminder({
			organizationId,
			vendorId,
			placementId,
		});
		return { queued: true, placementCount: 1 };
	}
}
