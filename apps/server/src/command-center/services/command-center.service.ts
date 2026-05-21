import { BadRequestException, Injectable } from "@nestjs/common";
import {
	MetricSnapshotPeriodType,
	PlacementStatus,
	RequisitionStatus,
	RequisitionType,
	SubmissionStage,
} from "@repo/db";
import {
	CandidateWorkforceType,
	COMMAND_CENTER_EMPTY_WORKFORCE_COUNTS,
	type CommandCenterWorkforceTypeKey,
	formatMetricValue,
	isHigherBetterMetric,
} from "@repo/shared";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { PrismaService } from "src/prisma/prisma.service";
import { QueryCommandCenterActiveWorkforceDto } from "../dto/query-command-center-active-workforce.dto";
import { QueryCommandCenterHiringFunnelDto } from "../dto/query-command-center-hiring-funnel.dto";
import {
	type OperationsFilterKey,
	QueryCommandCenterOperationsDto,
} from "../dto/query-command-center-operations.dto";
import {
	type PerformanceRangeKey,
	QueryCommandCenterPerformanceDto,
} from "../dto/query-command-center-performance.dto";

const DAY_MS = 24 * 60 * 60 * 1000;

type RequisitionFilterKey =
	| "slow-time-to-fill"
	| "no-submissions"
	| "low-submissions";
type CandidateFilterKey =
	| "overdue-submissions"
	| "aging-qualified"
	| "aging-shortlisted"
	| "overdue-offers"
	| "delayed-onboarding";

const REQUISITION_FILTERS: RequisitionFilterKey[] = [
	"slow-time-to-fill",
	"no-submissions",
	"low-submissions",
];
const CANDIDATE_FILTERS: CandidateFilterKey[] = [
	"overdue-submissions",
	"aging-qualified",
	"aging-shortlisted",
	"overdue-offers",
	"delayed-onboarding",
];

const OPERATIONS_FILTER_META: Record<
	OperationsFilterKey,
	{ heading: string; description: string }
> = {
	"slow-time-to-fill": {
		heading: "Showing: Slow Time to Fill",
		description: "Requisitions open longer than target fill time",
	},
	"no-submissions": {
		heading: "Showing: No Submissions",
		description: "Open requisitions with zero candidate submissions",
	},
	"low-submissions": {
		heading: "Showing: Low Submissions",
		description: "Requisitions with low submission volume",
	},
	"overdue-submissions": {
		heading: "Showing: Overdue Submissions",
		description: "Candidate submissions requiring review past deadline",
	},
	"aging-qualified": {
		heading: "Showing: Aging Qualified",
		description: "Candidates in Qualified stage exceeding SLA timeframe",
	},
	"aging-shortlisted": {
		heading: "Showing: Aging Shortlisted",
		description: "Candidates in Shortlisted stage past review SLA",
	},
	"overdue-offers": {
		heading: "Showing: Overdue Offers",
		description: "Offer responses pending beyond target time",
	},
	"delayed-onboarding": {
		heading: "Showing: Delayed / At-Risk Onboarding",
		description: "Accepted candidates delayed beyond expected onboarding",
	},
};

function safePercent(numerator: number, denominator: number): number {
	if (denominator <= 0) return 0;
	return (numerator / denominator) * 100;
}

function daysAgo(days: number): Date {
	return new Date(Date.now() - days * DAY_MS);
}

function daysFromNow(days: number): Date {
	return new Date(Date.now() + days * DAY_MS);
}

function daysOpenSince(createdAt: Date): number {
	return Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / DAY_MS));
}

function formatBillRate(value: number | null | undefined): string {
	if (value == null || Number.isNaN(value)) return "—";
	return `$${Math.round(value)}/hr`;
}

function performancePeriod(query: QueryCommandCenterPerformanceDto): {
	range: PerformanceRangeKey;
	periodType: MetricSnapshotPeriodType;
	startDate: Date;
	endDate: Date;
} {
	const range = query.range ?? "last-30-days";
	const now = new Date();

	if (range === "custom-date-range") {
		if (!query.startDate || !query.endDate) {
			throw new BadRequestException(
				"startDate and endDate are required for custom-date-range",
			);
		}
		const start = new Date(`${query.startDate.slice(0, 10)}T00:00:00.000Z`);
		const endInclusive = new Date(
			`${query.endDate.slice(0, 10)}T00:00:00.000Z`,
		);
		if (Number.isNaN(start.getTime()) || Number.isNaN(endInclusive.getTime())) {
			throw new BadRequestException("Invalid startDate or endDate");
		}
		if (start > endInclusive) {
			throw new BadRequestException("startDate cannot be after endDate");
		}
		const end = new Date(endInclusive);
		end.setUTCDate(end.getUTCDate() + 1);
		return {
			range,
			periodType: MetricSnapshotPeriodType.DAILY,
			startDate: start,
			endDate: end,
		};
	}

	if (range === "last-quarter") {
		const startOfCurrentMonth = new Date(
			Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
		);
		const start = new Date(startOfCurrentMonth);
		start.setUTCMonth(start.getUTCMonth() - 2);
		const end = new Date(startOfCurrentMonth);
		end.setUTCMonth(end.getUTCMonth() + 1);
		return {
			range,
			periodType: MetricSnapshotPeriodType.MONTHLY,
			startDate: start,
			endDate: end,
		};
	}

	const end = new Date();
	const start = new Date(end.getTime() - 30 * DAY_MS);
	return {
		range,
		periodType: MetricSnapshotPeriodType.DAILY,
		startDate: start,
		endDate: end,
	};
}

@Injectable()
export class CommandCenterService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

	async getOperations(
		organizationId: string,
		query: QueryCommandCenterOperationsDto,
	) {
		const page = query.page ?? 1;
		const limit = query.limit ?? 10;
		const skip = (page - 1) * limit;
		const activeFilterKey = query.filterKey ?? null;
		const activeCategory =
			activeFilterKey == null
				? null
				: REQUISITION_FILTERS.includes(activeFilterKey as RequisitionFilterKey)
					? "requisition-performance"
					: "candidate-processing-issues";

		const openRequisitionWhere = {
			organizationId,
			status: {
				notIn: [
					RequisitionStatus.DRAFT,
					RequisitionStatus.CANCELLED,
					RequisitionStatus.CLOSED,
					RequisitionStatus.FILLED,
					RequisitionStatus.PENDING_APPROVAL,
				],
			},
		};
		const slowThreshold = daysAgo(14);
		const noSubmissionThreshold = daysAgo(7);

		const overdueSubmissionWhere = {
			organizationId,
			stage: SubmissionStage.SUBMITTED,
			submittedAt: { lte: daysAgo(1) },
		};
		const agingQualifiedWhere = {
			organizationId,
			stage: SubmissionStage.QUALIFIED,
			qualifiedAt: { lte: daysAgo(3) },
		};
		const agingShortlistedWhere = {
			organizationId,
			stage: {
				in: [
					SubmissionStage.SHORTLISTED,
					SubmissionStage.INTERVIEW_SCHEDULED,
					SubmissionStage.INTERVIEW_COMPLETED,
				],
			},
			stageEnteredAt: { lte: daysAgo(7) },
		};
		const overdueOffersWhere = {
			organizationId,
			stage: SubmissionStage.OFFERED,
			offerExtendedAt: { lte: daysAgo(2) },
		};
		const delayedOnboardingWhere = {
			organizationId,
			stage: SubmissionStage.ACCEPTED,
			acceptedAt: { not: null },
			requisition: {
				startDate: { lte: daysAgo(5) },
			},
			placements: {
				none: {
					status: { in: [PlacementStatus.ACTIVE, PlacementStatus.COMPLETED] },
				},
			},
		};

		const [counts] = await this.prisma.$queryRaw<
			Array<{
				overdueCount: number;
				qualifiedCount: number;
				shortlistedCount: number;
				offersCount: number;
				delayedCount: number;
				slowTimeToFillCount: number;
				noSubmissionsCount: number;
				lowSubmissionsCount: number;
			}>
		>`
			SELECT
				(
					SELECT COUNT(*)::int
					FROM submission s
					WHERE s."organizationId" = ${organizationId}::uuid
						AND s.stage = 'SUBMITTED'::"SubmissionStage"
						AND s."submittedAt" <= ${daysAgo(1)}
				) AS "overdueCount",
				(
					SELECT COUNT(*)::int
					FROM submission s
					WHERE s."organizationId" = ${organizationId}::uuid
						AND s.stage = 'QUALIFIED'::"SubmissionStage"
						AND s."qualifiedAt" <= ${daysAgo(3)}
				) AS "qualifiedCount",
				(
					SELECT COUNT(*)::int
					FROM submission s
					WHERE s."organizationId" = ${organizationId}::uuid
						AND s.stage IN (
							'SHORTLISTED'::"SubmissionStage",
							'INTERVIEW_SCHEDULED'::"SubmissionStage",
							'INTERVIEW_COMPLETED'::"SubmissionStage"
						)
						AND s."stageEnteredAt" <= ${daysAgo(7)}
				) AS "shortlistedCount",
				(
					SELECT COUNT(*)::int
					FROM submission s
					WHERE s."organizationId" = ${organizationId}::uuid
						AND s.stage = 'OFFERED'::"SubmissionStage"
						AND s."offerExtendedAt" <= ${daysAgo(2)}
				) AS "offersCount",
				(
					SELECT COUNT(*)::int
					FROM submission s
					INNER JOIN requisition r ON r.id = s."requisitionId"
					WHERE s."organizationId" = ${organizationId}::uuid
						AND s.stage = 'ACCEPTED'::"SubmissionStage"
						AND s."acceptedAt" IS NOT NULL
						AND r."startDate" <= ${daysAgo(5)}
						AND NOT EXISTS (
							SELECT 1
							FROM placement p
							WHERE p."submissionId" = s.id
								AND p.status IN (
									'ACTIVE'::"PlacementStatus",
									'COMPLETED'::"PlacementStatus"
								)
						)
				) AS "delayedCount",
				(
					SELECT COUNT(*)::int
					FROM requisition r
					WHERE r."organizationId" = ${organizationId}::uuid
						AND r.status NOT IN (
							'DRAFT'::"RequisitionStatus",
							'CANCELLED'::"RequisitionStatus",
							'CLOSED'::"RequisitionStatus",
							'FILLED'::"RequisitionStatus",
							'PENDING_APPROVAL'::"RequisitionStatus"
						)
						AND r."createdAt" < ${slowThreshold}
				) AS "slowTimeToFillCount",
				(
					SELECT COUNT(*)::int
					FROM requisition r
					WHERE r."organizationId" = ${organizationId}::uuid
						AND r.status NOT IN (
							'DRAFT'::"RequisitionStatus",
							'CANCELLED'::"RequisitionStatus",
							'CLOSED'::"RequisitionStatus",
							'FILLED'::"RequisitionStatus",
							'PENDING_APPROVAL'::"RequisitionStatus"
						)
						AND r."createdAt" < ${noSubmissionThreshold}
						AND NOT EXISTS (
							SELECT 1 FROM submission s WHERE s."requisitionId" = r.id
						)
				) AS "noSubmissionsCount",
				(
					SELECT COUNT(*)::int
					FROM requisition r
					WHERE r."organizationId" = ${organizationId}::uuid
						AND r.status NOT IN (
							'DRAFT'::"RequisitionStatus",
							'CANCELLED'::"RequisitionStatus",
							'CLOSED'::"RequisitionStatus",
							'FILLED'::"RequisitionStatus",
							'PENDING_APPROVAL'::"RequisitionStatus"
						)
						AND (
							SELECT COUNT(*) FROM submission s WHERE s."requisitionId" = r.id
						) < 3
				) AS "lowSubmissionsCount"
		`;

		const overdueCount = Number(counts?.overdueCount ?? 0);
		const qualifiedCount = Number(counts?.qualifiedCount ?? 0);
		const shortlistedCount = Number(counts?.shortlistedCount ?? 0);
		const offersCount = Number(counts?.offersCount ?? 0);
		const delayedCount = Number(counts?.delayedCount ?? 0);
		const slowTimeToFillCount = Number(counts?.slowTimeToFillCount ?? 0);
		const noSubmissionsCount = Number(counts?.noSubmissionsCount ?? 0);
		const lowSubmissionsCount = Number(counts?.lowSubmissionsCount ?? 0);

		const mapCandidateRows = (
			rows: Array<{
				id: string;
				billingRate: number | null;
				candidate: { user: { name: string | null } };
				requisition: {
					jobTitle: string | null;
					billRate: number | null;
					organizationOccupation: { occupation: { name: string } } | null;
				};
				vendor: { name: string | null } | null;
				submittedByUser: { name: string | null } | null;
			}>,
			filterKey: CandidateFilterKey,
		) =>
			rows.map((row) => ({
				id: row.id,
				filterKey,
				candidate: row.candidate.user.name ?? "Unknown",
				jobTitle: row.requisition.jobTitle ?? "Untitled requisition",
				occupation:
					row.requisition.organizationOccupation?.occupation.name ?? "—",
				submittedBy:
					row.vendor?.name ?? row.submittedByUser?.name ?? "Unknown submitter",
				billRate: formatBillRate(row.billingRate ?? row.requisition.billRate),
			}));

		const requisitionCountsByFilter = {
			"slow-time-to-fill": slowTimeToFillCount,
			"no-submissions": noSubmissionsCount,
			"low-submissions": lowSubmissionsCount,
		};
		const candidateCountsByFilter = {
			"overdue-submissions": overdueCount,
			"aging-qualified": qualifiedCount,
			"aging-shortlisted": shortlistedCount,
			"overdue-offers": offersCount,
			"delayed-onboarding": delayedCount,
		};
		let rowsTotal = 0;
		let requisitionRows: unknown[] = [];
		let candidateRows: unknown[] = [];

		if (
			activeFilterKey &&
			REQUISITION_FILTERS.includes(activeFilterKey as RequisitionFilterKey)
		) {
			let requisitionIdSubset: string[] | null = null;
			if (activeFilterKey === "low-submissions") {
				const [totalRow] = await this.prisma.$queryRaw<
					Array<{ count: number }>
				>`
					SELECT COUNT(*)::int AS count
					FROM requisition r
					WHERE r."organizationId" = ${organizationId}::uuid
						AND r.status NOT IN (
							'DRAFT'::"RequisitionStatus",
							'CANCELLED'::"RequisitionStatus",
							'CLOSED'::"RequisitionStatus",
							'FILLED'::"RequisitionStatus",
							'PENDING_APPROVAL'::"RequisitionStatus"
						)
						AND (
							SELECT COUNT(*) FROM submission s WHERE s."requisitionId" = r.id
						) < 3
				`;
				rowsTotal = Number(totalRow?.count ?? 0);
				const idRows = await this.prisma.$queryRaw<Array<{ id: string }>>`
					SELECT r.id
					FROM requisition r
					WHERE r."organizationId" = ${organizationId}::uuid
						AND r.status NOT IN (
							'DRAFT'::"RequisitionStatus",
							'CANCELLED'::"RequisitionStatus",
							'CLOSED'::"RequisitionStatus",
							'FILLED'::"RequisitionStatus",
							'PENDING_APPROVAL'::"RequisitionStatus"
						)
						AND (
							SELECT COUNT(*) FROM submission s WHERE s."requisitionId" = r.id
						) < 3
					ORDER BY r."createdAt" DESC
					OFFSET ${skip}
					LIMIT ${limit}
				`;
				requisitionIdSubset = idRows.map((row) => row.id);
			}

			const requisitionFilterWhere =
				activeFilterKey === "slow-time-to-fill"
					? { ...openRequisitionWhere, createdAt: { lt: slowThreshold } }
					: activeFilterKey === "no-submissions"
						? {
								...openRequisitionWhere,
								createdAt: { lt: noSubmissionThreshold },
								submissions: { none: {} },
							}
						: {
								...openRequisitionWhere,
								id: { in: requisitionIdSubset ?? [] },
							};

			if (activeFilterKey !== "low-submissions") {
				rowsTotal = await this.prisma.requisition.count({
					where: requisitionFilterWhere,
				});
			}
			const requisitions =
				activeFilterKey === "low-submissions" &&
				(requisitionIdSubset?.length ?? 0) === 0
					? []
					: await this.prisma.requisition.findMany({
							where: requisitionFilterWhere,
							orderBy: { createdAt: "desc" },
							...(activeFilterKey === "low-submissions"
								? {}
								: { skip, take: limit }),
							select: {
								id: true,
								requisitionNumber: true,
								jobTitle: true,
								createdAt: true,
								status: true,
								type: true,
								numberOfPositions: true,
								hiringManager: { select: { name: true } },
								startDate: true,
								_count: {
									select: {
										submissions: true,
										placements: {
											where: {
												status: {
													in: [
														PlacementStatus.ACTIVE,
														PlacementStatus.COMPLETED,
													],
												},
											},
										},
									},
								},
								acceptanceCriteria: {
									select: {
										complianceListItem: { select: { id: true, name: true } },
									},
									orderBy: { createdAt: "asc" },
									take: 20,
								},
							},
						});
			const requisitionIds = requisitions.map((row) => row.id);
			const placementSummaryAgg = await this.prisma.placementSummary.groupBy({
				by: ["requisitionId"],
				where: {
					organizationId,
					requisitionId: { in: requisitionIds },
				},
				_sum: {
					complianceProgressCompleted: true,
					complianceProgressTotal: true,
					missingItemsCount: true,
					expiredItemsCount: true,
					expiringSoonItemsCount: true,
				},
			});
			const summaryByReq = new Map(
				placementSummaryAgg.map((row) => [row.requisitionId, row]),
			);
			const placementCandidates = await this.prisma.placement.findMany({
				where: {
					organizationId,
					requisitionId: { in: requisitionIds },
					status: PlacementStatus.UPCOMING,
					startDate: { gte: new Date(), lte: daysFromNow(21) },
					candidate: { is: { vendorId: { not: null } } },
				},
				orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
				select: {
					id: true,
					requisitionId: true,
					candidate: { select: { vendorId: true } },
					summary: {
						select: {
							complianceProgressCompleted: true,
							complianceProgressTotal: true,
						},
					},
				},
			});
			const reminderPlacementByRequisition = new Map<string, string>();
			for (const row of placementCandidates) {
				if (!row.candidate.vendorId) continue;
				if (reminderPlacementByRequisition.has(row.requisitionId)) continue;
				const total = row.summary?.complianceProgressTotal ?? 0;
				const done = row.summary?.complianceProgressCompleted ?? 0;
				if (total > 0 && done >= total) continue;
				reminderPlacementByRequisition.set(row.requisitionId, row.id);
			}

			requisitionRows = requisitions.map((row) => {
				const summary = summaryByReq.get(row.id);
				const completed = summary?._sum.complianceProgressCompleted ?? 0;
				const total = summary?._sum.complianceProgressTotal ?? 0;
				const missing = summary?._sum.missingItemsCount ?? 0;
				const expired = summary?._sum.expiredItemsCount ?? 0;
				const expiringSoon = summary?._sum.expiringSoonItemsCount ?? 0;
				const documents = [
					{
						name: "Missing Compliance Items",
						status: missing > 0 ? "Missing" : "Complete",
						sub: `${missing} item${missing === 1 ? "" : "s"}`,
						variant: missing > 0 ? "error" : "success",
					},
					{
						name: "Expired Credentials",
						status: expired > 0 ? "Expired" : "Complete",
						sub: `${expired} item${expired === 1 ? "" : "s"}`,
						variant: expired > 0 ? "error" : "success",
					},
					{
						name: "Expiring Soon",
						status: expiringSoon > 0 ? "Pending" : "Complete",
						sub: `${expiringSoon} item${expiringSoon === 1 ? "" : "s"}`,
						variant: expiringSoon > 0 ? "warning" : "success",
					},
				];
				const daysOpen = daysOpenSince(row.createdAt);
				return {
					id: row.id,
					filterKey: activeFilterKey as RequisitionFilterKey,
					requisitionId: row.requisitionNumber ?? row.id,
					requisitionName: row.jobTitle ?? "Untitled requisition",
					checklistItem:
						row.acceptanceCriteria[0]?.complianceListItem.name ??
						"Compliance Review",
					daysOpen,
					submissions: row._count.submissions,
					status: row.status,
					category:
						row.type === RequisitionType.LONG_TERM_ORDER
							? "Long Term Order"
							: "Per Diem Shift",
					assignedTo: row.hiringManager?.name ?? "—",
					progress:
						total > 0
							? Math.min(100, Math.round((completed / total) * 100))
							: row.numberOfPositions > 0
								? Math.min(
										100,
										Math.round(
											(row._count.placements / row.numberOfPositions) * 100,
										),
									)
								: 0,
					dueDate: row.startDate
						? row.startDate.toISOString().slice(0, 10)
						: "No start date",
					daysOverdue: Math.max(0, daysOpen - 14),
					priority:
						daysOpen > 14 || row._count.submissions === 0
							? "High Priority"
							: "Medium Priority",
					documents,
					activity: [],
					reminderPlacementId:
						reminderPlacementByRequisition.get(row.id) ?? null,
				};
			});
		}

		if (
			activeFilterKey &&
			CANDIDATE_FILTERS.includes(activeFilterKey as CandidateFilterKey)
		) {
			const candidateFilterWhere =
				activeFilterKey === "overdue-submissions"
					? overdueSubmissionWhere
					: activeFilterKey === "aging-qualified"
						? agingQualifiedWhere
						: activeFilterKey === "aging-shortlisted"
							? agingShortlistedWhere
							: activeFilterKey === "overdue-offers"
								? overdueOffersWhere
								: delayedOnboardingWhere;
			const orderBy =
				activeFilterKey === "overdue-submissions"
					? { submittedAt: "asc" as const }
					: activeFilterKey === "aging-qualified"
						? { qualifiedAt: "asc" as const }
						: activeFilterKey === "aging-shortlisted"
							? { stageEnteredAt: "asc" as const }
							: activeFilterKey === "overdue-offers"
								? { offerExtendedAt: "asc" as const }
								: { acceptedAt: "asc" as const };

			rowsTotal = await this.prisma.submission.count({
				where: candidateFilterWhere,
			});
			const rows = await this.prisma.submission.findMany({
				where: candidateFilterWhere,
				orderBy,
				skip,
				take: limit,
				select: {
					id: true,
					billingRate: true,
					candidate: { select: { user: { select: { name: true } } } },
					requisition: {
						select: {
							jobTitle: true,
							billRate: true,
							organizationOccupation: {
								select: { occupation: { select: { name: true } } },
							},
						},
					},
					vendor: { select: { name: true } },
					submittedByUser: { select: { name: true } },
				},
			});
			candidateRows = mapCandidateRows(
				rows,
				activeFilterKey as CandidateFilterKey,
			);
		}

		return {
			activeFilterKey,
			activeCategory,
			activeFilterMeta: activeFilterKey
				? OPERATIONS_FILTER_META[activeFilterKey]
				: null,
			requisitionCountsByFilter,
			candidateCountsByFilter,
			requisitionRows,
			candidateRows,
			rowsTotal,
			page,
			limit,
		};
	}

	async queueRequisitionReminder(
		organizationId: string,
		requisitionId: string,
		placementId?: string,
	) {
		const requisition = await this.prisma.requisition.findFirst({
			where: { id: requisitionId, organizationId },
			select: { id: true },
		});
		if (!requisition) {
			throw new BadRequestException("Requisition not found for organization");
		}

		const basePlacementWhere = {
			organizationId,
			requisitionId,
			status: PlacementStatus.UPCOMING,
			startDate: { gte: new Date(), lte: daysFromNow(21) },
			candidate: { is: { vendorId: { not: null } } },
		};
		const placement = placementId
			? await this.prisma.placement.findFirst({
					where: {
						...basePlacementWhere,
						id: placementId,
					},
					select: {
						id: true,
						candidate: { select: { vendorId: true } },
						summary: {
							select: {
								complianceProgressCompleted: true,
								complianceProgressTotal: true,
							},
						},
					},
				})
			: await this.prisma.placement.findFirst({
					where: basePlacementWhere,
					orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
					select: {
						id: true,
						candidate: { select: { vendorId: true } },
						summary: {
							select: {
								complianceProgressCompleted: true,
								complianceProgressTotal: true,
							},
						},
					},
				});
		const vendorId = placement?.candidate.vendorId;
		if (!placement || !vendorId) {
			throw new BadRequestException(
				"No reminder-eligible vendor onboarding placement found for this requisition",
			);
		}
		const total = placement.summary?.complianceProgressTotal ?? 0;
		const done = placement.summary?.complianceProgressCompleted ?? 0;
		if (total > 0 && done >= total) {
			throw new BadRequestException(
				"Selected placement onboarding is already complete",
			);
		}

		await this.backgroundJobs.enqueueVendorOnboardingReminder({
			organizationId,
			vendorId,
			placementId: placement.id,
		});
		return { queued: true as const, requisitionId, placementId: placement.id };
	}

	async getPerformance(
		organizationId: string,
		query: QueryCommandCenterPerformanceDto,
	) {
		const { startDate, endDate } = performancePeriod(query);
		const perfSummaryRows = await this.prisma.$queryRaw<
			Array<{
				activeCandidates: number;
				vendorSupplied: number;
				avgResponseDays: number | null;
			}>
		>`
			SELECT
				COUNT(DISTINCT s."candidateId") FILTER (
					WHERE s."submittedAt" >= ${startDate}
					AND s."submittedAt" < ${endDate}
				)::int AS "activeCandidates",
				COUNT(DISTINCT s."candidateId") FILTER (
					WHERE s."vendorId" IS NOT NULL
					AND s."submittedAt" >= ${startDate}
					AND s."submittedAt" < ${endDate}
				)::int AS "vendorSupplied",
				AVG(
					EXTRACT(EPOCH FROM (s."qualifiedAt" - s."submittedAt")) / 86400.0
				) FILTER (
					WHERE s."qualifiedAt" IS NOT NULL
					AND s."submittedAt" IS NOT NULL
					AND s."submittedAt" >= ${startDate}
					AND s."submittedAt" < ${endDate}
					AND s."qualifiedAt" >= ${startDate}
					AND s."qualifiedAt" < ${endDate}
				)::float AS "avgResponseDays"
			FROM submission s
			WHERE s."organizationId" = ${organizationId}::uuid
		`;
		const perfSummary = perfSummaryRows[0];

		const [totalOpenedReqs, filledReqs] = await Promise.all([
			this.prisma.requisition.count({
				where: {
					organizationId,
					type: RequisitionType.LONG_TERM_ORDER,
					publishedAt: { lt: endDate },
					status: {
						notIn: [
							RequisitionStatus.DRAFT,
							RequisitionStatus.PENDING_APPROVAL,
							RequisitionStatus.CANCELLED,
						],
					},
				},
			}),
			this.prisma.requisition.count({
				where: {
					organizationId,
					type: RequisitionType.LONG_TERM_ORDER,
					status: RequisitionStatus.FILLED,
					updatedAt: { gte: startDate, lt: endDate },
				},
			}),
		]);

		const avgResponseDays = perfSummary?.avgResponseDays ?? 0;

		const fillRate = safePercent(filledReqs, totalOpenedReqs);

		const orgMetrics = await this.prisma.organizationMetric.findMany({
			where: { organizationId, isActive: true, metric: { status: true } },
			select: { metricId: true, goal: true, metric: true },
		});
		const metrics = orgMetrics.map((row) => row.metric);
		const metricIds = metrics.map((m) => m.id);
		// Pick the best snapshot per metric:
		//   1. Prefer snapshots whose period overlaps the requested window (any periodType)
		//   2. Fall back to the most recent snapshot computed before the window ends
		// This ensures custom date ranges always show data even when only MONTHLY snapshots exist.
		const snapshots =
			metricIds.length === 0
				? []
				: await this.prisma.$queryRaw<
						Array<{ metricId: string; value: number }>
					>`
						SELECT DISTINCT ON (ms."metricId")
							ms."metricId",
							ms.value
						FROM organization_metric_snapshot ms
						WHERE ms."organizationId" = ${organizationId}::uuid
							AND ms."metricId" = ANY(${metricIds}::uuid[])
							AND ms."periodStart" < ${endDate}
						ORDER BY
							ms."metricId",
							(ms."periodEnd" > ${startDate}) DESC,
							ms."periodStart" DESC,
							ms."computedAt" DESC
					`;

		const orgMetricMap = new Map(orgMetrics.map((row) => [row.metricId, row]));
		const latestSnapshotByMetric = new Map(
			snapshots.map((row) => [row.metricId, row]),
		);

		const groupedMap = new Map<
			string,
			Array<{
				id: string;
				type: string;
				title: string;
				goal: string;
				current: string;
				status: "MEETING_GOAL" | "BELOW_GOAL";
			}>
		>();
		for (const metric of metrics) {
			const orgMetric = orgMetricMap.get(metric.id);
			const snapshot = latestSnapshotByMetric.get(metric.id);
			const goal = orgMetric?.goal ?? null;
			const currentValue = snapshot?.value ?? null;
			const status =
				goal == null || currentValue == null
					? "BELOW_GOAL"
					: isHigherBetterMetric(metric.key)
						? currentValue >= goal
							? "MEETING_GOAL"
							: "BELOW_GOAL"
						: currentValue <= goal
							? "MEETING_GOAL"
							: "BELOW_GOAL";

			const row = {
				id: metric.id,
				type: metric.type,
				title: metric.name,
				goal:
					goal == null || Number.isNaN(goal)
						? "Not set"
						: formatMetricValue(metric.key, goal),
				current:
					currentValue == null || Number.isNaN(currentValue)
						? "N/A"
						: formatMetricValue(metric.key, currentValue),
				status,
			} as const;

			const list = groupedMap.get(metric.type) ?? [];
			list.push(row);
			groupedMap.set(metric.type, list);
		}

		return {
			summaryStats: [
				{
					key: "active-candidates",
					value: String(perfSummary?.activeCandidates ?? 0),
				},
				{
					key: "vendor-supplied",
					value: String(perfSummary?.vendorSupplied ?? 0),
				},
				{ key: "avg-response-time", value: avgResponseDays.toFixed(1) },
				{ key: "fill-rate", value: `${fillRate.toFixed(1)}%` },
			],
			groupedMetrics: Array.from(groupedMap.entries()).map(([type, rows]) => ({
				type,
				metrics: rows,
			})),
		};
	}

	async getActiveWorkforce(
		organizationId: string,
		query: QueryCommandCenterActiveWorkforceDto,
	) {
		const selectedOccupationId = query.occupationId ?? "all";
		const occupationsRaw = await this.prisma.organizationOccupation.findMany({
			where: { organizationId },
			select: {
				id: true,
				occupation: { select: { name: true } },
			},
			orderBy: { createdAt: "asc" },
		});
		const occupations = [
			{ id: "all", name: "All Occupations" },
			...occupationsRaw.map((row) => ({
				id: row.id,
				name: row.occupation.name,
			})),
		];
		const occupationFilterId =
			selectedOccupationId !== "all" &&
			occupations.some((o) => o.id === selectedOccupationId)
				? selectedOccupationId
				: null;
		const workforceRows = await this.prisma.$queryRaw<
			Array<{ workforceType: string; count: number }>
		>`
			SELECT
				c."workforceType"::text,
				COUNT(*)::int AS count
			FROM candidate c
			WHERE c."workforceType" IS NOT NULL
				AND c."workforceType" != 'SELF'::"CandidateWorkforceType"
				AND (
					c."organizationId" = ${organizationId}::uuid
					OR c."vendorId" IN (
						SELECT ov."vendorId"
						FROM organization_vendor ov
						WHERE ov."organizationId" = ${organizationId}::uuid
					)
				)
				AND (
					${occupationFilterId}::uuid IS NULL
					OR c."occupationId" = (
						SELECT oo."occupationId"
						FROM organization_occupation oo
						WHERE oo.id = ${occupationFilterId}::uuid
					)
				)
			GROUP BY c."workforceType"
		`;
		const workforceCountsByType = { ...COMMAND_CENTER_EMPTY_WORKFORCE_COUNTS };
		for (const row of workforceRows) {
			if (
				!(Object.values(CandidateWorkforceType) as string[]).includes(
					row.workforceType,
				)
			)
				continue;
			const key = row.workforceType
				.toLowerCase()
				.replace(/_/g, "-") as CommandCenterWorkforceTypeKey;
			if (key in workforceCountsByType) {
				workforceCountsByType[key] = Number(row.count);
			}
		}

		return {
			occupations,
			selectedOccupationId: occupationFilterId ?? "all",
			workforceCountsByType,
		};
	}

	async getHiringFunnel(
		organizationId: string,
		query: QueryCommandCenterHiringFunnelDto,
	) {
		const search = query.search?.trim() || null;
		const location = query.location || null;
		const department = query.department || null;
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const skip = (page - 1) * limit;

		const [locationRows, departmentRows, listingRows, summaryRow] =
			await Promise.all([
				this.prisma.$queryRaw<Array<{ value: string }>>`
					SELECT DISTINCT loc.name AS value
					FROM requisition r
					LEFT JOIN organization_location loc ON loc.id = r."locationId"
					WHERE r."organizationId" = ${organizationId}::uuid
						AND r.status NOT IN (
							'DRAFT'::"RequisitionStatus",
							'CANCELLED'::"RequisitionStatus",
							'PENDING_APPROVAL'::"RequisitionStatus"
						)
						AND (
							${search}::text IS NULL
							OR r."jobTitle" ILIKE CONCAT('%', ${search}::text, '%')
							OR COALESCE(loc.name, '') ILIKE CONCAT('%', ${search}::text, '%')
						)
						AND loc.name IS NOT NULL
					ORDER BY loc.name
				`,
				this.prisma.$queryRaw<Array<{ value: string }>>`
					SELECT DISTINCT d.name AS value
					FROM requisition r
					LEFT JOIN department d ON d.id = r."departmentId"
					LEFT JOIN organization_location loc ON loc.id = r."locationId"
					WHERE r."organizationId" = ${organizationId}::uuid
						AND r.status NOT IN (
							'DRAFT'::"RequisitionStatus",
							'CANCELLED'::"RequisitionStatus",
							'PENDING_APPROVAL'::"RequisitionStatus"
						)
						AND (
							${search}::text IS NULL
							OR r."jobTitle" ILIKE CONCAT('%', ${search}::text, '%')
							OR COALESCE(loc.name, '') ILIKE CONCAT('%', ${search}::text, '%')
							OR COALESCE(d.name, '') ILIKE CONCAT('%', ${search}::text, '%')
						)
						AND d.name IS NOT NULL
					ORDER BY d.name
				`,
				this.prisma.$queryRaw<
					Array<{
						id: string;
						jobTitle: string | null;
						status: string;
						location: string | null;
						department: string | null;
						submitted: number;
						qualified: number;
						shortlisted: number;
						offers: number;
						rejected: number;
						placed: number;
					}>
				>`
					SELECT
						r.id,
						r."jobTitle",
						r.status::text AS status,
						loc.name AS location,
						d.name AS department,
						COUNT(s.id) FILTER (
							WHERE s.stage = 'SUBMITTED'::"SubmissionStage"
						)::int AS submitted,
						COUNT(s.id) FILTER (
							WHERE s.stage = 'QUALIFIED'::"SubmissionStage"
						)::int AS qualified,
						COUNT(s.id) FILTER (
							WHERE s.stage IN (
								'SHORTLISTED'::"SubmissionStage",
								'INTERVIEW_SCHEDULED'::"SubmissionStage",
								'INTERVIEW_COMPLETED'::"SubmissionStage"
							)
						)::int AS shortlisted,
						COUNT(s.id) FILTER (
							WHERE s.stage = 'OFFERED'::"SubmissionStage"
						)::int AS offers,
						COUNT(s.id) FILTER (
							WHERE s.stage IN (
								'REJECTED'::"SubmissionStage",
								'WITHDRAWN'::"SubmissionStage"
							)
						)::int AS rejected,
						COUNT(s.id) FILTER (
							WHERE s.stage = 'ACCEPTED'::"SubmissionStage"
						)::int AS placed
					FROM requisition r
					LEFT JOIN organization_location loc ON loc.id = r."locationId"
					LEFT JOIN department d ON d.id = r."departmentId"
					LEFT JOIN submission s ON s."requisitionId" = r.id
						AND s."organizationId" = ${organizationId}::uuid
					WHERE r."organizationId" = ${organizationId}::uuid
						AND r.status NOT IN (
							'DRAFT'::"RequisitionStatus",
							'CANCELLED'::"RequisitionStatus",
							'PENDING_APPROVAL'::"RequisitionStatus"
						)
						AND (
							${search}::text IS NULL
							OR r."jobTitle" ILIKE CONCAT('%', ${search}::text, '%')
							OR COALESCE(loc.name, '') ILIKE CONCAT('%', ${search}::text, '%')
							OR COALESCE(d.name, '') ILIKE CONCAT('%', ${search}::text, '%')
						)
						AND (${location}::text IS NULL OR loc.name = ${location}::text)
						AND (${department}::text IS NULL OR d.name = ${department}::text)
					GROUP BY r.id, r."jobTitle", r.status, loc.name, d.name, r."createdAt"
					ORDER BY r."createdAt" DESC
					OFFSET ${skip}
					LIMIT ${limit}
				`,
				this.prisma.$queryRaw<
					Array<{
						total: number;
						submitted: number;
						qualified: number;
						shortlisted: number;
						offers: number;
						rejected: number;
						placed: number;
					}>
				>`
					SELECT
						COUNT(DISTINCT r.id)::int AS total,
						COUNT(s.id) FILTER (
							WHERE s.stage = 'SUBMITTED'::"SubmissionStage"
						)::int AS submitted,
						COUNT(s.id) FILTER (
							WHERE s.stage = 'QUALIFIED'::"SubmissionStage"
						)::int AS qualified,
						COUNT(s.id) FILTER (
							WHERE s.stage IN (
								'SHORTLISTED'::"SubmissionStage",
								'INTERVIEW_SCHEDULED'::"SubmissionStage",
								'INTERVIEW_COMPLETED'::"SubmissionStage"
							)
						)::int AS shortlisted,
						COUNT(s.id) FILTER (
							WHERE s.stage = 'OFFERED'::"SubmissionStage"
						)::int AS offers,
						COUNT(s.id) FILTER (
							WHERE s.stage IN (
								'REJECTED'::"SubmissionStage",
								'WITHDRAWN'::"SubmissionStage"
							)
						)::int AS rejected,
						COUNT(s.id) FILTER (
							WHERE s.stage = 'ACCEPTED'::"SubmissionStage"
						)::int AS placed
					FROM requisition r
					LEFT JOIN submission s ON s."requisitionId" = r.id
						AND s."organizationId" = ${organizationId}::uuid
					LEFT JOIN organization_location loc ON loc.id = r."locationId"
					LEFT JOIN department d ON d.id = r."departmentId"
					WHERE r."organizationId" = ${organizationId}::uuid
						AND r.status NOT IN (
							'DRAFT'::"RequisitionStatus",
							'CANCELLED'::"RequisitionStatus",
							'PENDING_APPROVAL'::"RequisitionStatus"
						)
						AND (
							${search}::text IS NULL
							OR r."jobTitle" ILIKE CONCAT('%', ${search}::text, '%')
							OR COALESCE(loc.name, '') ILIKE CONCAT('%', ${search}::text, '%')
							OR COALESCE(d.name, '') ILIKE CONCAT('%', ${search}::text, '%')
						)
						AND (${location}::text IS NULL OR loc.name = ${location}::text)
						AND (${department}::text IS NULL OR d.name = ${department}::text)
				`,
			]);

		const locationOptions = locationRows.map((row) => ({
			value: row.value,
			label: row.value,
		}));
		const departmentOptions = departmentRows.map((row) => ({
			value: row.value,
			label: row.value,
		}));

		const stageMetric = (count: number, priorCount: number) => ({
			count,
			conversionRate:
				priorCount > 0 ? Math.round((count / priorCount) * 100) : 0,
		});

		const jobListings = listingRows.map((row) => ({
			id: row.id,
			jobTitle: row.jobTitle ?? "Untitled requisition",
			status: row.status === "FILLED" ? "closed" : "open",
			location: row.location ?? "Unknown",
			department: row.department ?? "Unknown",
			submitted: Number(row.submitted),
			qualified: stageMetric(Number(row.qualified), Number(row.submitted)),
			shortlisted: stageMetric(Number(row.shortlisted), Number(row.qualified)),
			offers: stageMetric(Number(row.offers), Number(row.shortlisted)),
			rejected: stageMetric(Number(row.rejected), Number(row.submitted)),
			placed: stageMetric(Number(row.placed), Number(row.offers)),
		}));

		const agg = summaryRow[0];
		const jobCount = Number(agg?.total ?? 0);
		const submitted = Number(agg?.submitted ?? 0);
		const qualified = Number(agg?.qualified ?? 0);
		const shortlisted = Number(agg?.shortlisted ?? 0);
		const offers = Number(agg?.offers ?? 0);
		const rejected = Number(agg?.rejected ?? 0);
		const placed = Number(agg?.placed ?? 0);
		const pct = (n: number, d: number) =>
			d > 0 ? `${Math.round((n / d) * 100)}%` : "0%";

		return {
			locationOptions,
			departmentOptions,
			jobListings,
			page,
			limit,
			total: jobCount,
			summaryByKey: {
				submitted: {
					value: submitted,
					helperText:
						jobCount > 0
							? `Across ${jobCount} job${jobCount !== 1 ? "s" : ""}`
							: "",
				},
				qualified: {
					value: qualified,
					helperText:
						submitted > 0 ? `${pct(qualified, submitted)} of submitted` : "",
				},
				shortlisted: {
					value: shortlisted,
					helperText:
						qualified > 0 ? `${pct(shortlisted, qualified)} of qualified` : "",
				},
				offers: {
					value: offers,
					helperText:
						shortlisted > 0 ? `${pct(offers, shortlisted)} of shortlisted` : "",
				},
				rejected: {
					value: rejected,
					helperText:
						submitted > 0 ? `${pct(rejected, submitted)} of submitted` : "",
				},
				placed: {
					value: placed,
					helperText: offers > 0 ? `${pct(placed, offers)} of offers` : "",
				},
			},
		};
	}
}
