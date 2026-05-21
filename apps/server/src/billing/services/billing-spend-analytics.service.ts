import { Injectable } from "@nestjs/common";
import { Prisma } from "@repo/db";
import type { PagePaginatedResponse } from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";
import type { QuerySpendAnalyticsDto } from "../dto/query-spend-analytics.dto";

/** Rows whose [periodStart, periodEnd] overlap the filter window (not only fully inside). */
function spendPeriodFilter(
	dto: Pick<QuerySpendAnalyticsDto, "periodFrom" | "periodTo">,
): Prisma.SpendAnalyticsWhereInput {
	const { periodFrom, periodTo } = dto;
	if (!periodFrom && !periodTo) {
		return {};
	}
	if (periodFrom && periodTo) {
		const from = new Date(periodFrom);
		const to = new Date(periodTo);
		return {
			AND: [{ periodStart: { lte: to } }, { periodEnd: { gte: from } }],
		};
	}
	if (periodFrom) {
		return { periodEnd: { gte: new Date(periodFrom) } };
	}
	return { periodStart: { lte: new Date(periodTo as string) } };
}

@Injectable()
export class BillingSpendAnalyticsService {
	constructor(private readonly prisma: PrismaService) {}

	async listSpendAnalytics(orgId: string, dto: QuerySpendAnalyticsDto) {
		const page = dto.page ?? 1;
		const limit = dto.limit ?? 10;
		const useAll = dto.all === true;
		const skip = useAll ? 0 : (page - 1) * limit;
		const costCenterTrimmed = dto.costCenter?.trim();

		const where: Prisma.SpendAnalyticsWhereInput = {
			organizationId: orgId,
			...spendPeriodFilter(dto),
			...(dto.periodType && { periodType: dto.periodType }),
			...(dto.departmentId && { departmentId: dto.departmentId }),
			...(costCenterTrimmed && {
				department: {
					costCenter: {
						equals: costCenterTrimmed,
						mode: "insensitive",
					},
				},
			}),
			...(dto.locationId && { locationId: dto.locationId }),
			...(dto.vendorId && { vendorId: dto.vendorId }),
			...(dto.occupationId && { occupationId: dto.occupationId }),
			...(dto.projectId && { projectId: dto.projectId }),
			...(dto.search && {
				OR: [{ periodType: { contains: dto.search, mode: "insensitive" } }],
			}),
		};

		const [total, rows] = await Promise.all([
			this.prisma.spendAnalytics.count({ where }),
			this.prisma.spendAnalytics.findMany({
				where,
				include: {
					department: { select: { id: true, name: true, costCenter: true } },
					location: { select: { id: true, name: true } },
					vendor: { select: { id: true, name: true } },
					occupation: { select: { id: true, name: true } },
					project: { select: { id: true, name: true } },
				},
				orderBy: [{ periodStart: "desc" }, { calculatedAt: "desc" }],
				...(useAll ? {} : { skip, take: limit }),
			}),
		]);

		return {
			data: rows,
			total,
			page,
			limit: useAll ? total : limit,
			totalPages: useAll ? 1 : Math.ceil(total / limit) || 1,
		} satisfies PagePaginatedResponse<(typeof rows)[number]>;
	}

	async getSpendSummary(orgId: string, dto: QuerySpendAnalyticsDto) {
		const costCenterTrimmed = dto.costCenter?.trim();
		const where: Prisma.SpendAnalyticsWhereInput = {
			organizationId: orgId,
			...spendPeriodFilter(dto),
			...(dto.periodType && { periodType: dto.periodType }),
			...(dto.departmentId && { departmentId: dto.departmentId }),
			...(costCenterTrimmed && {
				department: {
					costCenter: {
						equals: costCenterTrimmed,
						mode: "insensitive",
					},
				},
			}),
			...(dto.locationId && { locationId: dto.locationId }),
			...(dto.vendorId && { vendorId: dto.vendorId }),
			...(dto.occupationId && { occupationId: dto.occupationId }),
			...(dto.projectId && { projectId: dto.projectId }),
		};

		const [agg, rowCount] = await Promise.all([
			this.prisma.spendAnalytics.aggregate({
				where,
				_sum: {
					totalSpend: true,
					regularHours: true,
					overtimeHours: true,
					totalHours: true,
				},
			}),
			this.prisma.spendAnalytics.count({ where }),
		]);

		const periodFrom = dto.periodFrom ? new Date(dto.periodFrom) : null;
		const periodTo = dto.periodTo ? new Date(dto.periodTo) : null;

		const whereFragments: Prisma.Sql[] = [
			Prisma.sql`te."organizationId" = ${orgId}::uuid`,
			Prisma.sql`te."status" = 'APPROVED'`,
		];
		if (periodFrom && periodTo) {
			whereFragments.push(
				Prisma.sql`te."workDate" BETWEEN ${periodFrom} AND ${periodTo}`,
			);
		} else if (periodFrom) {
			whereFragments.push(Prisma.sql`te."workDate" >= ${periodFrom}`);
		} else if (periodTo) {
			whereFragments.push(Prisma.sql`te."workDate" <= ${periodTo}`);
		}
		if (dto.departmentId) {
			whereFragments.push(
				Prisma.sql`te."departmentId" = ${dto.departmentId}::uuid`,
			);
		}
		if (dto.locationId) {
			whereFragments.push(
				Prisma.sql`te."locationId" = ${dto.locationId}::uuid`,
			);
		}
		if (dto.vendorId) {
			whereFragments.push(Prisma.sql`p."vendorId" = ${dto.vendorId}::uuid`);
		}
		if (dto.occupationId) {
			whereFragments.push(
				Prisma.sql`oo."occupationId" = ${dto.occupationId}::uuid`,
			);
		}
		if (dto.projectId) {
			whereFragments.push(Prisma.sql`r."projectId" = ${dto.projectId}::uuid`);
		}
		if (costCenterTrimmed) {
			whereFragments.push(
				Prisma.sql`LOWER(d."costCenter") = LOWER(${costCenterTrimmed})`,
			);
		}

		const countsWhere = Prisma.join(whereFragments, " AND ");
		const needsPlacement =
			!!dto.vendorId || !!dto.occupationId || !!dto.projectId;
		const needsRequisition = !!dto.projectId;
		const needsOrgOccupation = !!dto.occupationId;
		const needsDepartment = !!costCenterTrimmed;

		const placementJoin = needsPlacement
			? Prisma.sql`LEFT JOIN "placement" p ON p."id" = te."placementId"`
			: Prisma.sql``;
		const requisitionJoin = needsRequisition
			? Prisma.sql`LEFT JOIN "requisition" r ON r."id" = p."requisitionId"`
			: Prisma.sql``;
		const orgOccupationJoin = needsOrgOccupation
			? Prisma.sql`LEFT JOIN "organization_occupation" oo ON oo."id" = r."organizationOccupationId"`
			: Prisma.sql``;
		const departmentJoin = needsDepartment
			? Prisma.sql`LEFT JOIN "department" d ON d."id" = te."departmentId"`
			: Prisma.sql``;

		const [counts] = await this.prisma.$queryRaw<
			[
				{
					totalInvoices: bigint;
					activePlacements: bigint;
					permanentHeadcount: bigint;
					contingentHeadcount: bigint;
					contractorHeadcount: bigint;
				},
			]
		>`
			WITH filtered AS (
				SELECT DISTINCT
					te."timesheetId" AS "timesheetId",
					te."candidateId" AS "candidateId",
					te."placementId" AS "placementId",
					c."workforceType" AS "workforceType"
				FROM "timesheet_entry" te
				JOIN "candidate" c ON c."id" = te."candidateId"
				${placementJoin}
				${requisitionJoin}
				${orgOccupationJoin}
				${departmentJoin}
				WHERE ${countsWhere}
			)
			SELECT
				(
					SELECT COUNT(DISTINCT inv."id")::bigint
					FROM "invoice_line_items" ili
					JOIN "invoices" inv
						ON inv."id" = ili."invoiceId"
						AND inv."organizationId" = ${orgId}::uuid
						AND inv."status" <> 'CANCELLED'
					JOIN filtered f2 ON f2."timesheetId" = ili."timesheetId"
				) AS "totalInvoices",
				COUNT(DISTINCT "placementId") FILTER (WHERE "placementId" IS NOT NULL)::bigint AS "activePlacements",
				COUNT(DISTINCT "candidateId") FILTER (
					WHERE "workforceType" IN ('INTERNAL_FULL_TIME', 'INTERNAL_PART_TIME')
				)::bigint AS "permanentHeadcount",
				COUNT(DISTINCT "candidateId") FILTER (
					WHERE "workforceType" IN ('INTERNAL_PRN', 'INTERNAL_FLOAT_POOL')
				)::bigint AS "contingentHeadcount",
				COUNT(DISTINCT "candidateId") FILTER (
					WHERE "workforceType" IN ('SELF', 'EXTERNAL_1099', 'EXTERNAL_EOR', 'EXTERNAL_VENDOR_LTO', 'EXTERNAL_VENDOR_PER_DIEM')
				)::bigint AS "contractorHeadcount"
			FROM filtered
		`;

		return {
			rowCount,
			totalSpend: agg._sum.totalSpend ?? 0,
			regularHours: agg._sum.regularHours ?? 0,
			overtimeHours: agg._sum.overtimeHours ?? 0,
			totalHours: agg._sum.totalHours ?? 0,
			totalInvoices: Number(counts?.totalInvoices ?? 0),
			activePlacements: Number(counts?.activePlacements ?? 0),
			permanentHeadcount: Number(counts?.permanentHeadcount ?? 0),
			contingentHeadcount: Number(counts?.contingentHeadcount ?? 0),
			contractorHeadcount: Number(counts?.contractorHeadcount ?? 0),
		};
	}

	async listOpenCommittedBreakdown(orgId: string, dto: QuerySpendAnalyticsDto) {
		const page = dto.page ?? 1;
		const limit = dto.limit ?? 20;
		const offset = (page - 1) * limit;
		const periodFrom = dto.periodFrom ? new Date(dto.periodFrom) : null;
		const periodTo = dto.periodTo ? new Date(dto.periodTo) : null;
		const costCenterTrimmed = dto.costCenter?.trim() || null;

		const whereFragments: Prisma.Sql[] = [
			Prisma.sql`r."organizationId" = ${orgId}::uuid`,
			Prisma.sql`r."status" IN ('ACTIVE','PUBLISHED','APPROVED')`,
		];

		if (periodFrom && periodTo) {
			whereFragments.push(
				Prisma.sql`(r."startDate" IS NULL OR r."startDate" <= ${periodTo})`,
			);
			whereFragments.push(
				Prisma.sql`(r."endDate" IS NULL OR r."endDate" >= ${periodFrom})`,
			);
		} else if (periodFrom) {
			whereFragments.push(
				Prisma.sql`(r."endDate" IS NULL OR r."endDate" >= ${periodFrom})`,
			);
		} else if (periodTo) {
			whereFragments.push(
				Prisma.sql`(r."startDate" IS NULL OR r."startDate" <= ${periodTo})`,
			);
		}

		if (dto.departmentId) {
			whereFragments.push(
				Prisma.sql`r."departmentId" = ${dto.departmentId}::uuid`,
			);
		}

		if (dto.locationId) {
			whereFragments.push(Prisma.sql`r."locationId" = ${dto.locationId}::uuid`);
		}

		if (costCenterTrimmed) {
			whereFragments.push(
				Prisma.sql`LOWER(d."costCenter") = LOWER(${costCenterTrimmed})`,
			);
		}

		if (dto.vendorId) {
			whereFragments.push(
				Prisma.sql`EXISTS (
					SELECT 1 FROM "placement" pv
					WHERE pv."requisitionId" = r."id"
					AND pv."vendorId" = ${dto.vendorId}::uuid
				)`,
			);
		}

		if (dto.projectId) {
			whereFragments.push(Prisma.sql`r."projectId" = ${dto.projectId}::uuid`);
		}

		const whereSql = Prisma.join(whereFragments, " AND ");

		type RawRow = {
			id: string;
			requisitionUuid: string;
			requisitionId: string;
			requisitionName: string;
			department: string;
			costCenter: string;
			type: "OPEN" | "COMMITTED";
			openSpend: number | null;
			committedSpend: number | null;
			totalCount: bigint;
			totalOpenSpend: number;
			totalCommittedSpend: number;
		};

		const rows = await this.prisma.$queryRaw<RawRow[]>`
			WITH req AS (
				SELECT
					r."id" AS "reqId",
					COALESCE(r."requisitionNumber", r."id"::text) AS "requisitionId",
					COALESCE(r."jobTitle", r."requisitionNumber", r."id"::text) AS "requisitionName",
					COALESCE(d."name", '—') AS "department",
					COALESCE(d."costCenter", '—') AS "costCenter",
					r."billRate" AS "billRate",
					COALESCE(r."hoursPerWeek", (r."shiftHours" * r."shiftsPerWeek")::float8) AS "hoursPerWeek",
					COALESCE(
						r."lengthWeeks",
						CASE
							WHEN r."startDate" IS NOT NULL AND r."endDate" IS NOT NULL
								THEN CEIL(EXTRACT(EPOCH FROM (r."endDate" - r."startDate")) / (7 * 24 * 60 * 60))::int
							ELSE NULL
						END
					) AS "lengthWeeks",
					r."numberOfPositions" AS "numberOfPositions"
				FROM "requisition" r
				LEFT JOIN "department" d ON d."id" = r."departmentId"
				WHERE ${whereSql}
			),
			placement_stats AS (
				SELECT
					p."requisitionId" AS "reqId",
					COUNT(*) FILTER (WHERE p."status" IN ('UPCOMING','ACTIVE','PENDING','ENDING_SOON','ON_HOLD'))::int AS "filledCount",
					COUNT(*) FILTER (WHERE p."status" = 'UPCOMING')::int AS "committedCount",
					COALESCE(SUM(
						CASE
							WHEN p."status" = 'UPCOMING'
								THEN COALESCE(p."billRate", r."billRate", 0)::float8
									* COALESCE(p."hoursPerWeek", r."hoursPerWeek", 0)::float8
									* COALESCE(p."totalWeeks", r."lengthWeeks", 0)::float8
							ELSE 0::float8
						END
					), 0)::float8 AS "committedSpend"
				FROM "placement" p
				JOIN req r ON r."reqId" = p."requisitionId"
				WHERE p."organizationId" = ${orgId}::uuid
				GROUP BY p."requisitionId"
			),
			derived AS (
				SELECT
					r."reqId",
					r."requisitionId",
					r."requisitionName",
					r."department",
					r."costCenter",
					GREATEST(r."numberOfPositions" - COALESCE(ps."filledCount", 0), 0)::int AS "openPositions",
					r."billRate",
					r."hoursPerWeek",
					r."lengthWeeks",
					COALESCE(ps."committedSpend", 0)::float8 AS "committedSpend"
				FROM req r
				LEFT JOIN placement_stats ps ON ps."reqId" = r."reqId"
			),
			unioned AS (
				SELECT
					(d."reqId"::text || '-OPEN') AS "id",
					d."reqId"::text AS "requisitionUuid",
					d."requisitionId" AS "requisitionId",
					d."requisitionName" AS "requisitionName",
					d."department" AS "department",
					d."costCenter" AS "costCenter",
					'OPEN'::text AS "type",
					CASE
						WHEN d."openPositions" > 0
							AND d."billRate" IS NOT NULL
							AND d."hoursPerWeek" IS NOT NULL
							AND d."lengthWeeks" IS NOT NULL
							THEN (d."openPositions"::float8 * d."billRate" * d."hoursPerWeek" * d."lengthWeeks")::float8
						ELSE NULL
					END AS "openSpend",
					NULL::float8 AS "committedSpend"
				FROM derived d
				WHERE d."openPositions" > 0

				UNION ALL

				SELECT
					(d."reqId"::text || '-COMMITTED') AS "id",
					d."reqId"::text AS "requisitionUuid",
					d."requisitionId" AS "requisitionId",
					d."requisitionName" AS "requisitionName",
					d."department" AS "department",
					d."costCenter" AS "costCenter",
					'COMMITTED'::text AS "type",
					NULL::float8 AS "openSpend",
					CASE WHEN d."committedSpend" > 0 THEN d."committedSpend" ELSE NULL END AS "committedSpend"
				FROM derived d
				WHERE d."committedSpend" > 0
			)
			SELECT
				u.*,
				COUNT(*) OVER() AS "totalCount",
				COALESCE(SUM(COALESCE(u."openSpend", 0)) OVER(), 0)::float8 AS "totalOpenSpend",
				COALESCE(SUM(COALESCE(u."committedSpend", 0)) OVER(), 0)::float8 AS "totalCommittedSpend"
			FROM unioned u
			ORDER BY COALESCE(u."openSpend", u."committedSpend") DESC NULLS LAST
			LIMIT ${limit}
			OFFSET ${offset}
		`;

		const total = Number(rows[0]?.totalCount ?? 0);
		const totalOpenSpend = Number(rows[0]?.totalOpenSpend ?? 0);
		const totalCommittedSpend = Number(rows[0]?.totalCommittedSpend ?? 0);

		const data = rows.map(
			({
				totalCount: _tc,
				totalOpenSpend: _tos,
				totalCommittedSpend: _tcs,
				...row
			}) => row,
		);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit) || 1,
			totalOpenSpend,
			totalCommittedSpend,
		};
	}
}
