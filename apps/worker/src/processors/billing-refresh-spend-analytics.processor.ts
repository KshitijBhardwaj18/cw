import type { PrismaClient } from "@repo/db";
import type { BillingRefreshSpendAnalyticsPayload } from "@repo/shared";

type SpendAnalyticsAggregateRow = {
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
	totalInvoices: number;
	averageBillRate: number;
	permanentHeadcount: number | bigint;
	contingentHeadcount: number | bigint;
	contractorHeadcount: number | bigint;
	calculatedAt: Date;
};

function toInt(value: number | bigint): number {
	return typeof value === "bigint" ? Number(value) : value;
}

function parsePeriod(payload: BillingRefreshSpendAnalyticsPayload): {
	periodFrom: Date;
	periodTo: Date;
} {
	const from = new Date(payload.periodFrom);
	const to = new Date(payload.periodTo);
	if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
		throw new Error(
			"Spend analytics refresh payload has invalid periodFrom/periodTo",
		);
	}
	return from.getTime() <= to.getTime()
		? { periodFrom: from, periodTo: to }
		: { periodFrom: to, periodTo: from };
}

function monthBounds(
	periodFrom: Date,
	periodTo: Date,
): {
	monthFrom: Date;
	monthTo: Date;
} {
	const monthFrom = new Date(
		Date.UTC(periodFrom.getUTCFullYear(), periodFrom.getUTCMonth(), 1),
	);
	const monthTo = new Date(
		Date.UTC(
			periodTo.getUTCFullYear(),
			periodTo.getUTCMonth() + 1,
			0,
			23,
			59,
			59,
			999,
		),
	);
	return { monthFrom, monthTo };
}

async function computeSpendSnapshotRows(
	prisma: PrismaClient,
	organizationId: string,
	monthFrom: Date,
	monthTo: Date,
): Promise<SpendAnalyticsAggregateRow[]> {
	return prisma.$queryRaw<SpendAnalyticsAggregateRow[]>`
		WITH base_timesheet AS (
			SELECT
				te."organizationId" AS "organizationId",
				date_trunc('month', te."workDate") AS "periodStart",
				(date_trunc('month', te."workDate") + INTERVAL '1 month' - INTERVAL '1 millisecond') AS "periodEnd",
				'month'::text AS "periodType",
				te."departmentId" AS "departmentId",
				te."locationId" AS "locationId",
				p."vendorId" AS "vendorId",
				oo."occupationId" AS "occupationId",
				r."projectId" AS "projectId",
				te."candidateId" AS "candidateId",
				te."placementId" AS "placementId",
				COALESCE(te."billAmount", 0)::float8 AS "billAmount",
				COALESCE(te."regularHours", 0)::float8 AS "regularHours",
				COALESCE(te."overtimeHours", 0)::float8 AS "overtimeHours",
				COALESCE(te."hours", te."regularHours" + te."overtimeHours", 0)::float8 AS "totalHours"
			FROM "timesheet_entry" te
			LEFT JOIN "placement" p ON p."id" = te."placementId"
			LEFT JOIN "requisition" r ON r."id" = p."requisitionId"
			LEFT JOIN "organization_occupation" oo ON oo."id" = r."organizationOccupationId"
			WHERE te."organizationId" = ${organizationId}::uuid
				AND te."status" = 'APPROVED'
				AND te."workDate" BETWEEN ${monthFrom} AND ${monthTo}
		),
		base_internal_fees AS (
			SELECT
				inv."organizationId" AS "organizationId",
				date_trunc('month', COALESCE(ili."periodStart", inv."periodStartDate", inv."invoiceDate")) AS "periodStart",
				(date_trunc('month', COALESCE(ili."periodStart", inv."periodStartDate", inv."invoiceDate")) + INTERVAL '1 month' - INTERVAL '1 millisecond') AS "periodEnd",
				'month'::text AS "periodType",
				COALESCE(r."departmentId", s."departmentId") AS "departmentId",
				COALESCE(r."locationId", s."locationId") AS "locationId",
				COALESCE(p."vendorId", pda."vendorId", inv."vendorId") AS "vendorId",
				COALESCE(oo."occupationId", s."occupationId") AS "occupationId",
				r."projectId" AS "projectId",
				COALESCE(ili."candidateId", pda."candidateId") AS "candidateId",
				ili."placementId" AS "placementId",
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
			WHERE inv."organizationId" = ${organizationId}::uuid
				AND inv."status" <> 'CANCELLED'
				AND ili."lineType" IN ('TECH_FEE_INTERNAL_LTO', 'TECH_FEE_INTERNAL_SHIFT')
				AND COALESCE(ili."periodStart", inv."periodStartDate", inv."invoiceDate")
					BETWEEN ${monthFrom} AND ${monthTo}
		),
		base AS (
			SELECT * FROM base_timesheet
			UNION ALL
			SELECT * FROM base_internal_fees
		)
		SELECT
			(
				substr(md5(
					b."organizationId"::text || '|' ||
					b."periodStart"::text || '|' ||
					b."periodEnd"::text || '|' ||
					b."periodType" || '|' ||
					COALESCE(b."departmentId"::text, '') || '|' ||
					COALESCE(b."locationId"::text, '') || '|' ||
					COALESCE(b."vendorId"::text, '') || '|' ||
					COALESCE(b."occupationId"::text, '') || '|' ||
					COALESCE(b."projectId"::text, '')
				), 1, 8) || '-' ||
				substr(md5(
					b."organizationId"::text || '|' ||
					b."periodStart"::text || '|' ||
					b."periodEnd"::text || '|' ||
					b."periodType" || '|' ||
					COALESCE(b."departmentId"::text, '') || '|' ||
					COALESCE(b."locationId"::text, '') || '|' ||
					COALESCE(b."vendorId"::text, '') || '|' ||
					COALESCE(b."occupationId"::text, '') || '|' ||
					COALESCE(b."projectId"::text, '')
				), 9, 4) || '-' ||
				substr(md5(
					b."organizationId"::text || '|' ||
					b."periodStart"::text || '|' ||
					b."periodEnd"::text || '|' ||
					b."periodType" || '|' ||
					COALESCE(b."departmentId"::text, '') || '|' ||
					COALESCE(b."locationId"::text, '') || '|' ||
					COALESCE(b."vendorId"::text, '') || '|' ||
					COALESCE(b."occupationId"::text, '') || '|' ||
					COALESCE(b."projectId"::text, '')
				), 13, 4) || '-' ||
				substr(md5(
					b."organizationId"::text || '|' ||
					b."periodStart"::text || '|' ||
					b."periodEnd"::text || '|' ||
					b."periodType" || '|' ||
					COALESCE(b."departmentId"::text, '') || '|' ||
					COALESCE(b."locationId"::text, '') || '|' ||
					COALESCE(b."vendorId"::text, '') || '|' ||
					COALESCE(b."occupationId"::text, '') || '|' ||
					COALESCE(b."projectId"::text, '')
				), 17, 4) || '-' ||
				substr(md5(
					b."organizationId"::text || '|' ||
					b."periodStart"::text || '|' ||
					b."periodEnd"::text || '|' ||
					b."periodType" || '|' ||
					COALESCE(b."departmentId"::text, '') || '|' ||
					COALESCE(b."locationId"::text, '') || '|' ||
					COALESCE(b."vendorId"::text, '') || '|' ||
					COALESCE(b."occupationId"::text, '') || '|' ||
					COALESCE(b."projectId"::text, '')
				), 21, 12)
			)::uuid AS "id",
			b."organizationId",
			b."periodStart",
			b."periodEnd",
			b."periodType",
			b."departmentId",
			b."locationId",
			b."vendorId",
			b."occupationId",
			b."projectId",
			COALESCE(SUM(b."billAmount"), 0)::float8 AS "totalSpend",
			COALESCE(SUM(b."regularHours"), 0)::float8 AS "regularHours",
			COALESCE(SUM(b."overtimeHours"), 0)::float8 AS "overtimeHours",
			COALESCE(SUM(b."totalHours"), 0)::float8 AS "totalHours",
			COUNT(DISTINCT b."placementId") FILTER (WHERE b."placementId" IS NOT NULL)::int AS "activePlacements",
			0::int AS "totalInvoices",
			CASE
				WHEN COALESCE(SUM(b."totalHours"), 0) > 0
					THEN (COALESCE(SUM(b."billAmount"), 0) / COALESCE(SUM(b."totalHours"), 0))::float8
				ELSE 0::float8
			END AS "averageBillRate",
			COUNT(DISTINCT b."candidateId") FILTER (
				WHERE c."workforceType" IN ('INTERNAL_FULL_TIME', 'INTERNAL_PART_TIME')
			)::int AS "permanentHeadcount",
			COUNT(DISTINCT b."candidateId") FILTER (
				WHERE c."workforceType" IN ('INTERNAL_PRN', 'INTERNAL_FLOAT_POOL')
			)::int AS "contingentHeadcount",
			COUNT(DISTINCT b."candidateId") FILTER (
				WHERE c."workforceType" IN ('SELF', 'EXTERNAL_1099', 'EXTERNAL_EOR', 'EXTERNAL_VENDOR_LTO', 'EXTERNAL_VENDOR_PER_DIEM')
			)::int AS "contractorHeadcount",
			NOW() AS "calculatedAt"
		FROM base b
		LEFT JOIN "candidate" c ON c."id" = b."candidateId"
		GROUP BY
			b."organizationId",
			b."periodStart",
			b."periodEnd",
			b."periodType",
			b."departmentId",
			b."locationId",
			b."vendorId",
			b."occupationId",
			b."projectId"
	`;
}

export async function runBillingRefreshSpendAnalyticsProcessor(
	prisma: PrismaClient,
	payload: BillingRefreshSpendAnalyticsPayload,
): Promise<void> {
	const { periodFrom, periodTo } = parsePeriod(payload);
	const { monthFrom, monthTo } = monthBounds(periodFrom, periodTo);
	const rows = await computeSpendSnapshotRows(
		prisma,
		payload.organizationId,
		monthFrom,
		monthTo,
	);

	const refreshedIds: string[] = [];
	await prisma.$transaction(async (tx) => {
		for (const row of rows) {
			const activePlacements = toInt(row.activePlacements);
			const permanentHeadcount = toInt(row.permanentHeadcount);
			const contingentHeadcount = toInt(row.contingentHeadcount);
			const contractorHeadcount = toInt(row.contractorHeadcount);
			await tx.spendAnalytics.upsert({
				where: { id: row.id },
				create: {
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
					totalSpend: row.totalSpend,
					regularHours: row.regularHours,
					overtimeHours: row.overtimeHours,
					totalHours: row.totalHours,
					activePlacements,
					totalInvoices: row.totalInvoices,
					averageBillRate: row.averageBillRate,
					permanentHeadcount,
					contingentHeadcount,
					contractorHeadcount,
					calculatedAt: row.calculatedAt,
				},
				update: {
					periodStart: row.periodStart,
					periodEnd: row.periodEnd,
					periodType: row.periodType,
					departmentId: row.departmentId,
					locationId: row.locationId,
					vendorId: row.vendorId,
					occupationId: row.occupationId,
					projectId: row.projectId,
					totalSpend: row.totalSpend,
					regularHours: row.regularHours,
					overtimeHours: row.overtimeHours,
					totalHours: row.totalHours,
					activePlacements,
					totalInvoices: row.totalInvoices,
					averageBillRate: row.averageBillRate,
					permanentHeadcount,
					contingentHeadcount,
					contractorHeadcount,
					calculatedAt: row.calculatedAt,
				},
			});
			refreshedIds.push(row.id);
		}

		await tx.spendAnalytics.deleteMany({
			where: {
				organizationId: payload.organizationId,
				periodStart: { gte: monthFrom, lte: monthTo },
				...(refreshedIds.length > 0 ? { id: { notIn: refreshedIds } } : {}),
			},
		});
	});
}
