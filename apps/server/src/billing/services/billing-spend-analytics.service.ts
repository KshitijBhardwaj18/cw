import { Injectable } from "@nestjs/common";
import { Prisma } from "@repo/db";
import type { PagePaginatedResponse } from "@repo/shared";
import { PrismaService } from "src/prisma/prisma.service";
import type { QuerySpendAnalyticsDto } from "../dto/query-spend-analytics.dto";

type Dimensions = {
	departmentId?: string;
	locationId?: string;
	vendorId?: string;
	occupationId?: string;
	projectId?: string;
	costCenter?: string;
};

type PeriodWindow = {
	periodFrom: Date | null;
	periodTo: Date | null;
};

type SpendAggregateRow = {
	id: string;
	organizationId: string;
	periodStart: Date;
	periodEnd: Date;
	periodType: string;
	departmentId: string | null;
	locationId: string | null;
	vendorId: string | null;
	occupationId: string | null;
	projectId: string | null;
	totalSpend: number;
	regularHours: number;
	overtimeHours: number;
	totalHours: number;
	activePlacements: number | bigint;
	totalInvoices: number | bigint;
	averageBillRate: number;
	permanentHeadcount: number | bigint;
	contingentHeadcount: number | bigint;
	contractorHeadcount: number | bigint;
	calculatedAt: Date;
	totalCount: bigint;
	departmentName: string | null;
	departmentCostCenter: string | null;
	locationName: string | null;
	vendorName: string | null;
	occupationName: string | null;
	projectName: string | null;
};

type SpendSummaryRow = {
	totalSpend: number;
	regularHours: number;
	overtimeHours: number;
	totalHours: number;
	totalInvoices: bigint;
	activePlacements: bigint;
	permanentHeadcount: bigint;
	contingentHeadcount: bigint;
	contractorHeadcount: bigint;
	rowCount: bigint;
};

type SavingsByDepartmentRow = {
	departmentId: string | null;
	departmentName: string | null;
	departmentCostCenter: string | null;
	savingsAmount: number;
	totalSavings: number;
};

@Injectable()
export class BillingSpendAnalyticsService {
	constructor(private readonly prisma: PrismaService) {}

	async listSpendAnalytics(orgId: string, dto: QuerySpendAnalyticsDto) {
		const page = dto.page ?? 1;
		const limit = dto.limit ?? 10;
		const useAll = dto.all === true;
		const skip = useAll ? 0 : (page - 1) * limit;

		const dims = this.extractDims(dto);
		const period = this.extractPeriod(dto);
		const baseCte = this.buildBaseCte(orgId, period, dims);
		const paginationSql = useAll
			? Prisma.sql``
			: Prisma.sql`LIMIT ${limit} OFFSET ${skip}`;

		const rows = await this.prisma.$queryRaw<SpendAggregateRow[]>`
			${baseCte},
			grouped AS (
				SELECT
					b."organizationId",
					b."periodStart",
					b."periodEnd",
					'month'::text AS "periodType",
					b."departmentId",
					b."locationId",
					b."vendorId",
					b."occupationId",
					b."projectId",
					COALESCE(SUM(b."billAmount"), 0)::float8 AS "totalSpend",
					COALESCE(SUM(b."regularHours"), 0)::float8 AS "regularHours",
					COALESCE(SUM(b."overtimeHours"), 0)::float8 AS "overtimeHours",
					COALESCE(SUM(b."totalHours"), 0)::float8 AS "totalHours",
					COUNT(DISTINCT b."placementId") FILTER (WHERE b."placementId" IS NOT NULL)::bigint AS "activePlacements",
					COUNT(DISTINCT b."invoiceId") FILTER (WHERE b."invoiceId" IS NOT NULL)::bigint AS "totalInvoices",
					CASE
						WHEN COALESCE(SUM(b."totalHours"), 0) > 0
							THEN (COALESCE(SUM(b."billAmount"), 0) / COALESCE(SUM(b."totalHours"), 0))::float8
						ELSE 0::float8
					END AS "averageBillRate",
					COUNT(DISTINCT b."candidateId") FILTER (
						WHERE b."workforceType" IN ('INTERNAL_FULL_TIME', 'INTERNAL_PART_TIME')
					)::bigint AS "permanentHeadcount",
					COUNT(DISTINCT b."candidateId") FILTER (
						WHERE b."workforceType" IN ('INTERNAL_PRN', 'INTERNAL_FLOAT_POOL')
					)::bigint AS "contingentHeadcount",
					COUNT(DISTINCT b."candidateId") FILTER (
						WHERE b."workforceType" IN ('EXTERNAL_1099', 'EXTERNAL_EOR', 'EXTERNAL_VENDOR_LTO', 'EXTERNAL_VENDOR_PER_DIEM')
					)::bigint AS "contractorHeadcount"
				FROM base b
				GROUP BY
					b."organizationId",
					b."periodStart",
					b."periodEnd",
					b."departmentId",
					b."locationId",
					b."vendorId",
					b."occupationId",
					b."projectId"
			)
			SELECT
				md5(
					g."organizationId"::text || '|' ||
					g."periodStart"::text || '|' ||
					g."periodEnd"::text || '|' ||
					COALESCE(g."departmentId"::text, '') || '|' ||
					COALESCE(g."locationId"::text, '') || '|' ||
					COALESCE(g."vendorId"::text, '') || '|' ||
					COALESCE(g."occupationId"::text, '') || '|' ||
					COALESCE(g."projectId"::text, '')
				) AS "id",
				g."organizationId",
				g."periodStart",
				g."periodEnd",
				g."periodType",
				g."departmentId",
				g."locationId",
				g."vendorId",
				g."occupationId",
				g."projectId",
				g."totalSpend",
				g."regularHours",
				g."overtimeHours",
				g."totalHours",
				g."activePlacements",
				g."totalInvoices",
				g."averageBillRate",
				g."permanentHeadcount",
				g."contingentHeadcount",
				g."contractorHeadcount",
				NOW() AS "calculatedAt",
				COUNT(*) OVER() AS "totalCount",
				d."name" AS "departmentName",
				d."costCenter" AS "departmentCostCenter",
				l."name" AS "locationName",
				v."name" AS "vendorName",
				occ."name" AS "occupationName",
				prj."name" AS "projectName"
			FROM grouped g
			LEFT JOIN "department" d ON d."id" = g."departmentId"
			LEFT JOIN "organization_location" l ON l."id" = g."locationId"
			LEFT JOIN "vendor" v ON v."id" = g."vendorId"
			LEFT JOIN "occupation" occ ON occ."id" = g."occupationId"
			LEFT JOIN "project" prj ON prj."id" = g."projectId"
			ORDER BY g."periodStart" DESC, g."totalSpend" DESC
			${paginationSql}
		`;

		const total = Number(rows[0]?.totalCount ?? 0);
		const data = rows.map((row) => this.toResponseRow(row));

		return {
			data,
			total,
			page,
			limit: useAll ? total : limit,
			totalPages: useAll ? 1 : Math.ceil(total / limit) || 1,
		} satisfies PagePaginatedResponse<ReturnType<typeof this.toResponseRow>>;
	}

	async getSpendSummary(orgId: string, dto: QuerySpendAnalyticsDto) {
		const dims = this.extractDims(dto);
		const period = this.extractPeriod(dto);
		const baseCte = this.buildBaseCte(orgId, period, dims);

		const [summaryRows, savingsRows] = await Promise.all([
			this.prisma.$queryRaw<SpendSummaryRow[]>`
			${baseCte}
			SELECT
				COALESCE(SUM(b."billAmount"), 0)::float8 AS "totalSpend",
				COALESCE(SUM(b."regularHours"), 0)::float8 AS "regularHours",
				COALESCE(SUM(b."overtimeHours"), 0)::float8 AS "overtimeHours",
				COALESCE(SUM(b."totalHours"), 0)::float8 AS "totalHours",
				COUNT(DISTINCT b."invoiceId") FILTER (WHERE b."invoiceId" IS NOT NULL)::bigint AS "totalInvoices",
				COUNT(DISTINCT b."placementId") FILTER (WHERE b."placementId" IS NOT NULL)::bigint AS "activePlacements",
				COUNT(DISTINCT b."candidateId") FILTER (
					WHERE b."workforceType" IN ('INTERNAL_FULL_TIME', 'INTERNAL_PART_TIME')
				)::bigint AS "permanentHeadcount",
				COUNT(DISTINCT b."candidateId") FILTER (
					WHERE b."workforceType" IN ('INTERNAL_PRN', 'INTERNAL_FLOAT_POOL')
				)::bigint AS "contingentHeadcount",
				COUNT(DISTINCT b."candidateId") FILTER (
					WHERE b."workforceType" IN ('EXTERNAL_1099', 'EXTERNAL_EOR', 'EXTERNAL_VENDOR_LTO', 'EXTERNAL_VENDOR_PER_DIEM')
				)::bigint AS "contractorHeadcount",
				COUNT(DISTINCT (
					b."organizationId"::text || '|' ||
					b."periodStart"::text || '|' ||
					b."periodEnd"::text || '|' ||
					COALESCE(b."departmentId"::text, '') || '|' ||
					COALESCE(b."locationId"::text, '') || '|' ||
					COALESCE(b."vendorId"::text, '') || '|' ||
					COALESCE(b."occupationId"::text, '') || '|' ||
					COALESCE(b."projectId"::text, '')
				))::bigint AS "rowCount"
			FROM base b
		`,
			this.queryCanceledRequisitionSavings(orgId, period, dims),
		]);

		const row = summaryRows[0];
		const totalSavings = savingsRows.reduce(
			(sum, r) => sum + Number(r.savingsAmount ?? 0),
			0,
		);

		return {
			rowCount: Number(row?.rowCount ?? 0),
			totalSpend: Number(row?.totalSpend ?? 0),
			regularHours: Number(row?.regularHours ?? 0),
			overtimeHours: Number(row?.overtimeHours ?? 0),
			totalHours: Number(row?.totalHours ?? 0),
			totalInvoices: Number(row?.totalInvoices ?? 0),
			activePlacements: Number(row?.activePlacements ?? 0),
			permanentHeadcount: Number(row?.permanentHeadcount ?? 0),
			contingentHeadcount: Number(row?.contingentHeadcount ?? 0),
			contractorHeadcount: Number(row?.contractorHeadcount ?? 0),
			totalSavings,
		};
	}

	async getSavingsByDepartment(orgId: string, dto: QuerySpendAnalyticsDto) {
		const dims = this.extractDims(dto);
		const period = this.extractPeriod(dto);
		const rows = await this.queryCanceledRequisitionSavings(
			orgId,
			period,
			dims,
		);

		const totalSavings = rows.reduce(
			(sum, r) => sum + Number(r.savingsAmount ?? 0),
			0,
		);

		const data = rows.map((row) => ({
			id: row.departmentId ?? "unassigned",
			departmentId: row.departmentId,
			departmentName: row.departmentName ?? "Unassigned",
			departmentCostCenter: row.departmentCostCenter,
			savingsAmount: Number(row.savingsAmount ?? 0),
			pctOfTotal:
				totalSavings > 0
					? (Number(row.savingsAmount ?? 0) / totalSavings) * 100
					: 0,
		}));

		return {
			data,
			totalSavings,
		};
	}

	private async queryCanceledRequisitionSavings(
		orgId: string,
		period: PeriodWindow,
		dims: Dimensions,
	): Promise<SavingsByDepartmentRow[]> {
		const whereFragments: Prisma.Sql[] = [
			Prisma.sql`r."organizationId" = ${orgId}::uuid`,
			Prisma.sql`r."status" = 'CANCELLED'`,
			Prisma.sql`r."billRate" IS NOT NULL`,
			Prisma.sql`r."hoursPerWeek" IS NOT NULL`,
			Prisma.sql`r."lengthWeeks" IS NOT NULL`,
		];

		if (period.periodFrom && period.periodTo) {
			whereFragments.push(
				Prisma.sql`(r."startDate" IS NULL OR r."startDate" <= ${period.periodTo})`,
			);
			whereFragments.push(
				Prisma.sql`(r."endDate" IS NULL OR r."endDate" >= ${period.periodFrom})`,
			);
		} else if (period.periodFrom) {
			whereFragments.push(
				Prisma.sql`(r."endDate" IS NULL OR r."endDate" >= ${period.periodFrom})`,
			);
		} else if (period.periodTo) {
			whereFragments.push(
				Prisma.sql`(r."startDate" IS NULL OR r."startDate" <= ${period.periodTo})`,
			);
		}

		if (dims.departmentId) {
			whereFragments.push(
				Prisma.sql`r."departmentId" = ${dims.departmentId}::uuid`,
			);
		}
		if (dims.locationId) {
			whereFragments.push(
				Prisma.sql`r."locationId" = ${dims.locationId}::uuid`,
			);
		}
		if (dims.projectId) {
			whereFragments.push(Prisma.sql`r."projectId" = ${dims.projectId}::uuid`);
		}
		if (dims.costCenter) {
			whereFragments.push(
				Prisma.sql`LOWER(d."costCenter") = LOWER(${dims.costCenter})`,
			);
		}

		const whereSql = Prisma.join(whereFragments, " AND ");

		return this.prisma.$queryRaw<SavingsByDepartmentRow[]>`
			SELECT
				r."departmentId" AS "departmentId",
				d."name" AS "departmentName",
				d."costCenter" AS "departmentCostCenter",
				COALESCE(SUM(
					r."billRate"
					* r."hoursPerWeek"
					* r."lengthWeeks"
					* r."numberOfPositions"
				), 0)::float8 AS "savingsAmount",
				0::float8 AS "totalSavings"
			FROM "requisition" r
			LEFT JOIN "department" d ON d."id" = r."departmentId"
			WHERE ${whereSql}
			GROUP BY r."departmentId", d."name", d."costCenter"
			ORDER BY "savingsAmount" DESC
		`;
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
			Prisma.sql`r."status" IN ('PUBLISHED','SCHEDULED')`,
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
					COUNT(*) FILTER (WHERE p."status" IN ('UPCOMING','ACTIVE','ON_HOLD'))::int AS "filledCount",
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

	private extractDims(dto: QuerySpendAnalyticsDto): Dimensions {
		return {
			departmentId: dto.departmentId,
			locationId: dto.locationId,
			vendorId: dto.vendorId,
			occupationId: dto.occupationId,
			projectId: dto.projectId,
			costCenter: dto.costCenter?.trim() || undefined,
		};
	}

	private extractPeriod(dto: QuerySpendAnalyticsDto): PeriodWindow {
		return {
			periodFrom: dto.periodFrom ? new Date(dto.periodFrom) : null,
			periodTo: dto.periodTo ? new Date(dto.periodTo) : null,
		};
	}

	private buildBaseCte(
		orgId: string,
		period: PeriodWindow,
		dims: Dimensions,
	): Prisma.Sql {
		const timesheetFilters = this.buildTimesheetFilters(orgId, period, dims);
		const internalFeesFilters = this.buildInternalFeesFilters(
			orgId,
			period,
			dims,
		);

		return Prisma.sql`
			WITH base_timesheet AS (
				SELECT
					te."organizationId" AS "organizationId",
					date_trunc('month', te."workDate") AS "periodStart",
					(date_trunc('month', te."workDate") + INTERVAL '1 month' - INTERVAL '1 millisecond') AS "periodEnd",
					te."departmentId" AS "departmentId",
					te."locationId" AS "locationId",
					p."vendorId" AS "vendorId",
					oo."occupationId" AS "occupationId",
					r."projectId" AS "projectId",
					te."candidateId" AS "candidateId",
					c."workforceType" AS "workforceType",
					te."placementId" AS "placementId",
					NULL::uuid AS "invoiceId",
					COALESCE(te."billAmount", 0)::float8 AS "billAmount",
					COALESCE(te."regularHours", 0)::float8 AS "regularHours",
					COALESCE(te."overtimeHours", 0)::float8 AS "overtimeHours",
					COALESCE(te."hours", te."regularHours" + te."overtimeHours", 0)::float8 AS "totalHours"
				FROM "timesheet_entry" te
				LEFT JOIN "candidate" c ON c."id" = te."candidateId"
				LEFT JOIN "placement" p ON p."id" = te."placementId"
				LEFT JOIN "requisition" r ON r."id" = p."requisitionId"
				LEFT JOIN "organization_occupation" oo ON oo."id" = r."organizationOccupationId"
				LEFT JOIN "department" d ON d."id" = te."departmentId"
				WHERE ${timesheetFilters}
			),
			base_internal_fees AS (
				SELECT
					inv."organizationId" AS "organizationId",
					date_trunc('month', COALESCE(ili."periodStart", inv."periodStartDate", inv."invoiceDate")) AS "periodStart",
					(date_trunc('month', COALESCE(ili."periodStart", inv."periodStartDate", inv."invoiceDate")) + INTERVAL '1 month' - INTERVAL '1 millisecond') AS "periodEnd",
					COALESCE(r."departmentId", s."departmentId") AS "departmentId",
					COALESCE(r."locationId", s."locationId") AS "locationId",
					COALESCE(p."vendorId", pda."vendorId", inv."vendorId") AS "vendorId",
					COALESCE(oo."occupationId", s."occupationId") AS "occupationId",
					r."projectId" AS "projectId",
					COALESCE(ili."candidateId", pda."candidateId") AS "candidateId",
					cif."workforceType" AS "workforceType",
					ili."placementId" AS "placementId",
					inv."id" AS "invoiceId",
					COALESCE(ili."amount", 0)::float8 AS "billAmount",
					0::float8 AS "regularHours",
					0::float8 AS "overtimeHours",
					COALESCE(ili."quantity", 0)::float8 AS "totalHours"
				FROM "invoice_line_items" ili
				JOIN "invoices" inv ON inv."id" = ili."invoiceId"
				LEFT JOIN "placement" p ON p."id" = ili."placementId"
				LEFT JOIN "requisition" r ON r."id" = p."requisitionId"
				LEFT JOIN "organization_occupation" oo ON oo."id" = r."organizationOccupationId"
				LEFT JOIN LATERAL (
					SELECT NULLIF((regexp_match(ili."description", '^Internal shift ([0-9a-fA-F-]{36}) tech fee$'))[1], '')::uuid AS "assignmentId"
				) rx ON TRUE
				LEFT JOIN "per_diem_assignments" pda ON pda."id" = rx."assignmentId"
				LEFT JOIN "per_diem_shifts" s ON s."id" = pda."shiftId"
				LEFT JOIN "candidate" cif ON cif."id" = COALESCE(ili."candidateId", pda."candidateId")
				LEFT JOIN "department" difd ON difd."id" = COALESCE(r."departmentId", s."departmentId")
				WHERE ${internalFeesFilters}
			),
			base AS (
				SELECT * FROM base_timesheet
				UNION ALL
				SELECT * FROM base_internal_fees
			)
		`;
	}

	private buildTimesheetFilters(
		orgId: string,
		period: PeriodWindow,
		dims: Dimensions,
	): Prisma.Sql {
		const fragments: Prisma.Sql[] = [
			Prisma.sql`te."organizationId" = ${orgId}::uuid`,
			Prisma.sql`te."status" = 'APPROVED'`,
		];

		if (period.periodFrom && period.periodTo) {
			fragments.push(
				Prisma.sql`te."workDate" BETWEEN ${period.periodFrom} AND ${period.periodTo}`,
			);
		} else if (period.periodFrom) {
			fragments.push(Prisma.sql`te."workDate" >= ${period.periodFrom}`);
		} else if (period.periodTo) {
			fragments.push(Prisma.sql`te."workDate" <= ${period.periodTo}`);
		}

		if (dims.departmentId) {
			fragments.push(
				Prisma.sql`te."departmentId" = ${dims.departmentId}::uuid`,
			);
		}
		if (dims.locationId) {
			fragments.push(Prisma.sql`te."locationId" = ${dims.locationId}::uuid`);
		}
		if (dims.vendorId) {
			fragments.push(Prisma.sql`p."vendorId" = ${dims.vendorId}::uuid`);
		}
		if (dims.occupationId) {
			fragments.push(
				Prisma.sql`oo."occupationId" = ${dims.occupationId}::uuid`,
			);
		}
		if (dims.projectId) {
			fragments.push(Prisma.sql`r."projectId" = ${dims.projectId}::uuid`);
		}
		if (dims.costCenter) {
			fragments.push(
				Prisma.sql`LOWER(d."costCenter") = LOWER(${dims.costCenter})`,
			);
		}

		return Prisma.join(fragments, " AND ");
	}

	private buildInternalFeesFilters(
		orgId: string,
		period: PeriodWindow,
		dims: Dimensions,
	): Prisma.Sql {
		const fragments: Prisma.Sql[] = [
			Prisma.sql`inv."organizationId" = ${orgId}::uuid`,
			Prisma.sql`inv."status" <> 'CANCELLED'`,
			Prisma.sql`ili."lineType" IN ('TECH_FEE_INTERNAL_LTO', 'TECH_FEE_INTERNAL_SHIFT')`,
		];

		if (period.periodFrom && period.periodTo) {
			fragments.push(
				Prisma.sql`COALESCE(ili."periodStart", inv."periodStartDate", inv."invoiceDate") BETWEEN ${period.periodFrom} AND ${period.periodTo}`,
			);
		} else if (period.periodFrom) {
			fragments.push(
				Prisma.sql`COALESCE(ili."periodStart", inv."periodStartDate", inv."invoiceDate") >= ${period.periodFrom}`,
			);
		} else if (period.periodTo) {
			fragments.push(
				Prisma.sql`COALESCE(ili."periodStart", inv."periodStartDate", inv."invoiceDate") <= ${period.periodTo}`,
			);
		}

		if (dims.departmentId) {
			fragments.push(
				Prisma.sql`COALESCE(r."departmentId", s."departmentId") = ${dims.departmentId}::uuid`,
			);
		}
		if (dims.locationId) {
			fragments.push(
				Prisma.sql`COALESCE(r."locationId", s."locationId") = ${dims.locationId}::uuid`,
			);
		}
		if (dims.vendorId) {
			fragments.push(
				Prisma.sql`COALESCE(p."vendorId", pda."vendorId", inv."vendorId") = ${dims.vendorId}::uuid`,
			);
		}
		if (dims.occupationId) {
			fragments.push(
				Prisma.sql`COALESCE(oo."occupationId", s."occupationId") = ${dims.occupationId}::uuid`,
			);
		}
		if (dims.projectId) {
			fragments.push(Prisma.sql`r."projectId" = ${dims.projectId}::uuid`);
		}
		if (dims.costCenter) {
			fragments.push(
				Prisma.sql`LOWER(difd."costCenter") = LOWER(${dims.costCenter})`,
			);
		}

		return Prisma.join(fragments, " AND ");
	}

	private toResponseRow(row: SpendAggregateRow) {
		return {
			id: row.id,
			organizationId: row.organizationId,
			periodStart: row.periodStart,
			periodEnd: row.periodEnd,
			periodType: row.periodType,
			departmentId: row.departmentId,
			locationId: row.locationId,
			vendorId: row.vendorId,
			occupationId: row.occupationId,
			projectId: row.projectId,
			totalSpend: Number(row.totalSpend ?? 0),
			regularHours: Number(row.regularHours ?? 0),
			overtimeHours: Number(row.overtimeHours ?? 0),
			totalHours: Number(row.totalHours ?? 0),
			activePlacements: Number(row.activePlacements ?? 0),
			totalInvoices: Number(row.totalInvoices ?? 0),
			averageBillRate: Number(row.averageBillRate ?? 0),
			permanentHeadcount: Number(row.permanentHeadcount ?? 0),
			contingentHeadcount: Number(row.contingentHeadcount ?? 0),
			contractorHeadcount: Number(row.contractorHeadcount ?? 0),
			calculatedAt: row.calculatedAt,
			department: row.departmentId
				? {
						id: row.departmentId,
						name: row.departmentName ?? "",
						costCenter: row.departmentCostCenter,
					}
				: null,
			location: row.locationId
				? { id: row.locationId, name: row.locationName ?? "" }
				: null,
			vendor: row.vendorId
				? { id: row.vendorId, name: row.vendorName ?? "" }
				: null,
			occupation: row.occupationId
				? { id: row.occupationId, name: row.occupationName ?? "" }
				: null,
			project: row.projectId
				? { id: row.projectId, name: row.projectName ?? "" }
				: null,
		};
	}
}
