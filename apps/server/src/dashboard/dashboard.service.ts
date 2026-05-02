import { Injectable } from "@nestjs/common";
import { $Enums } from "@repo/db";
import { PrismaService } from "src/prisma/prisma.service";
import { DashboardSummaryDto } from "./dto/dashboard-summary.dto";

@Injectable()
export class DashboardService {
	constructor(private readonly prisma: PrismaService) {}

	async getDashboardSummary(): Promise<DashboardSummaryDto> {
		const totalSpendPromise = this.prisma.invoice.aggregate({
			where: {
				status: {
					not: $Enums.InvoiceStatus.CANCELLED,
				},
			},
			_sum: {
				totalAmount: true,
			},
		});

		const totalAvailableSpendPromise = this.prisma.$queryRaw<
			[{ totalAvailableSpend: number | null }]
		>`
			WITH req AS (
				SELECT
					r."id" AS "reqId",
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
				WHERE r."status" IN ('ACTIVE','PUBLISHED','APPROVED')
			),
			placement_stats AS (
				SELECT
					p."requisitionId" AS "reqId",
					COUNT(*) FILTER (WHERE p."status" IN ('UPCOMING','ACTIVE','PENDING'))::int AS "filledCount",
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
				GROUP BY p."requisitionId"
			),
			derived AS (
				SELECT
					r."reqId",
					GREATEST(r."numberOfPositions" - COALESCE(ps."filledCount", 0), 0)::int AS "openPositions",
					r."billRate",
					r."hoursPerWeek",
					r."lengthWeeks",
					COALESCE(ps."committedSpend", 0)::float8 AS "committedSpend"
				FROM req r
				LEFT JOIN placement_stats ps ON ps."reqId" = r."reqId"
			)
			SELECT
				COALESCE(SUM(
					CASE
						WHEN d."openPositions" > 0
							AND d."billRate" IS NOT NULL
							AND d."hoursPerWeek" IS NOT NULL
							AND d."lengthWeeks" IS NOT NULL
							THEN (d."openPositions"::float8 * d."billRate" * d."hoursPerWeek" * d."lengthWeeks")::float8
						ELSE 0::float8
					END
				) + SUM(d."committedSpend"), 0)::float8 AS "totalAvailableSpend"
			FROM derived d
		`;

		const [
			totalOrganizations,
			totalLocations,
			totalVendors,
			totalUsers,
			totalChannelPartners,
			totalSpendAgg,
			totalAvailableSpendRows,
		] = await Promise.all([
			this.prisma.organization.count(),
			this.prisma.organizationLocation.count(),
			this.prisma.vendor.count({
				where: {
					isActive: true,
				},
			}),
			this.prisma.user.count({
				where: {
					status: $Enums.UserStatus.ACTIVE,
					role: {
						not: $Enums.UserRole.CANDIDATE_USER,
					},
				},
			}),
			this.prisma.mSP.count(),
			totalSpendPromise,
			totalAvailableSpendPromise,
		]);

		const totalSpend = totalSpendAgg._sum.totalAmount ?? 0;
		const totalAvailableSpend =
			Number(totalAvailableSpendRows?.[0]?.totalAvailableSpend ?? 0) || 0;

		return {
			totalOrganizations,
			totalLocations,
			totalVendors,
			totalUsers,
			totalChannelPartners,
			totalSpend,
			totalAvailableSpend,
		};
	}
}
