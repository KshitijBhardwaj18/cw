import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { type Metric, MetricSnapshotPeriodType } from "@repo/db";
import { BackgroundJobsService } from "src/background-jobs/background-jobs.service";
import { PrismaService } from "../../prisma/prisma.service";
import { QueryOrganizationMetricsDto } from "../dto/query-organization-metrics.dto";
import { RecomputeMetricSnapshotsDto } from "../dto/recompute-metric-snapshots.dto";
import { UpdateOrganizationMetricDto } from "../dto/update-organization-metric.dto";
import { UpsertOrganizationMetricDto } from "../dto/upsert-organization-metric.dto";

@Injectable()
export class MetricsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly backgroundJobs: BackgroundJobsService,
	) {}

	async findAll(): Promise<Metric[]> {
		return this.prisma.metric.findMany({
			orderBy: [{ type: "asc" }, { name: "asc" }],
		});
	}

	async updateStatus(id: string, status: boolean): Promise<Metric> {
		const existing = await this.prisma.metric.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundException("Metric not found.");
		}

		return this.prisma.$transaction(async (tx) => {
			const updated = await tx.metric.update({
				where: { id },
				data: { status },
			});
			if (!status) {
				await tx.organizationMetric.updateMany({
					where: { metricId: id, isActive: true },
					data: { isActive: false },
				});
			}
			return updated;
		});
	}

	private async assertOrganizationExists(
		organizationId: string,
	): Promise<void> {
		const exists = await this.prisma.organization.findUnique({
			where: { id: organizationId },
			select: { id: true },
		});
		if (!exists) {
			throw new NotFoundException("Organization not found.");
		}
	}

	private assertValidSnapshotRange(
		periodType: MetricSnapshotPeriodType,
		periodStart?: string,
		periodEnd?: string,
	): void {
		if (!periodStart && !periodEnd) return;
		if (!periodStart || !periodEnd) {
			throw new BadRequestException(
				"Start date and end date must both be provided together.",
			);
		}
		const start = new Date(periodStart);
		const end = new Date(periodEnd);
		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
			throw new BadRequestException("Invalid start date or end date.");
		}
		if (start >= end) {
			throw new BadRequestException(
				"Start date must be earlier than end date.",
			);
		}
		const isUtcMidnight =
			start.getUTCHours() === 0 &&
			start.getUTCMinutes() === 0 &&
			start.getUTCSeconds() === 0 &&
			start.getUTCMilliseconds() === 0 &&
			end.getUTCHours() === 0 &&
			end.getUTCMinutes() === 0 &&
			end.getUTCSeconds() === 0 &&
			end.getUTCMilliseconds() === 0;
		if (!isUtcMidnight) {
			throw new BadRequestException(
				"Start and end dates must align to a UTC day boundary.",
			);
		}
		if (periodType === MetricSnapshotPeriodType.DAILY) {
			const nextDay = new Date(start);
			nextDay.setUTCDate(nextDay.getUTCDate() + 1);
			if (end.getTime() !== nextDay.getTime()) {
				throw new BadRequestException(
					"Daily range must cover exactly one day.",
				);
			}
			return;
		}
		if (periodType === MetricSnapshotPeriodType.WEEKLY) {
			// Monday-based week to match processor default.
			if (start.getUTCDay() !== 1) {
				throw new BadRequestException("Weekly range must start on a Monday.");
			}
			const nextWeek = new Date(start);
			nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
			if (end.getTime() !== nextWeek.getTime()) {
				throw new BadRequestException(
					"Weekly range must cover exactly seven days.",
				);
			}
			return;
		}
		if (start.getUTCDate() !== 1 || end.getUTCDate() !== 1) {
			throw new BadRequestException(
				"Monthly range must start on the first day of a month.",
			);
		}
		const nextMonth = new Date(start);
		nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
		if (end.getTime() !== nextMonth.getTime()) {
			throw new BadRequestException(
				"Monthly range must cover exactly one month.",
			);
		}
	}

	async listByOrganization(
		organizationId: string,
		query?: QueryOrganizationMetricsDto,
	) {
		await this.assertOrganizationExists(organizationId);
		const effectivePeriodType =
			query?.periodType ?? MetricSnapshotPeriodType.MONTHLY;
		const [metrics, orgMetrics] = await Promise.all([
			this.prisma.metric.findMany({
				where: { status: true },
				orderBy: [{ type: "asc" }, { name: "asc" }],
			}),
			this.prisma.organizationMetric.findMany({
				where: { organizationId },
				select: {
					id: true,
					metricId: true,
					goal: true,
					isActive: true,
					updatedAt: true,
				},
			}),
		]);
		const metricIds = metrics.map((m) => m.id);
		const snapshots =
			metricIds.length === 0
				? []
				: await this.prisma.organizationMetricSnapshot.findMany({
						where: {
							organizationId,
							metricId: { in: metricIds },
							periodType: effectivePeriodType,
						},
						orderBy: [
							{ metricId: "asc" },
							{ periodStart: "desc" },
							{ computedAt: "desc" },
						],
						distinct: ["metricId"],
					});
		const byMetricId = new Map(orgMetrics.map((row) => [row.metricId, row]));
		const snapshotsByMetricId = new Map(
			snapshots.map((row) => [row.metricId, row]),
		);
		return metrics.map((metric) => {
			const orgMetric = byMetricId.get(metric.id);
			const latestSnapshot = snapshotsByMetricId.get(metric.id) ?? null;
			return {
				metric,
				organizationMetric: orgMetric ?? null,
				latestSnapshot,
			};
		});
	}

	async triggerSnapshotRecompute(
		organizationId: string,
		dto: RecomputeMetricSnapshotsDto,
	) {
		await this.assertOrganizationExists(organizationId);
		this.assertValidSnapshotRange(
			dto.periodType,
			dto.periodStart,
			dto.periodEnd,
		);
		const queued = await this.backgroundJobs.enqueueMetricSnapshotRecompute({
			organizationId,
			periodType: dto.periodType,
			periodStart: dto.periodStart,
			periodEnd: dto.periodEnd,
			metricIds: dto.metricIds,
		});
		return {
			jobId: queued.jobId,
			organizationId,
			status: "queued",
			periodType: dto.periodType,
			periodStart: dto.periodStart ?? null,
			periodEnd: dto.periodEnd ?? null,
			metricIds: dto.metricIds ?? [],
		};
	}

	async upsertOrganizationMetric(
		organizationId: string,
		dto: UpsertOrganizationMetricDto,
	) {
		await this.assertOrganizationExists(organizationId);
		const metric = await this.prisma.metric.findUnique({
			where: { id: dto.metricId },
			select: { id: true, status: true },
		});
		if (!metric) {
			throw new NotFoundException("Metric not found.");
		}
		const nextIsActive = dto.isActive ?? true;
		if (!metric.status && nextIsActive) {
			throw new BadRequestException(
				"Metric is globally disabled and cannot be enabled for organization",
			);
		}
		const row = await this.prisma.organizationMetric.upsert({
			where: {
				organizationId_metricId: {
					organizationId,
					metricId: dto.metricId,
				},
			},
			create: {
				organizationId,
				metricId: dto.metricId,
				goal: dto.goal,
				isActive: dto.isActive ?? true,
			},
			update: {
				goal: dto.goal,
				...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
			},
			include: {
				metric: true,
			},
		});
		await this.backgroundJobs.enqueueMonthlyMetricSnapshotForOrganization(
			organizationId,
			[dto.metricId],
		);
		return row;
	}

	async updateOrganizationMetric(
		organizationId: string,
		metricId: string,
		dto: UpdateOrganizationMetricDto,
	) {
		await this.assertOrganizationExists(organizationId);
		if (dto.isActive === true) {
			const metric = await this.prisma.metric.findUnique({
				where: { id: metricId },
				select: { status: true },
			});
			if (!metric) {
				throw new NotFoundException("Metric not found.");
			}
			if (!metric.status) {
				throw new BadRequestException(
					"Metric is globally disabled and cannot be enabled for organization",
				);
			}
		}
		const existing = await this.prisma.organizationMetric.findUnique({
			where: {
				organizationId_metricId: {
					organizationId,
					metricId,
				},
			},
			select: { id: true },
		});
		if (!existing) {
			throw new NotFoundException("Organization metric not found.");
		}
		const row = await this.prisma.organizationMetric.update({
			where: {
				organizationId_metricId: {
					organizationId,
					metricId,
				},
			},
			data: {
				...(dto.goal !== undefined ? { goal: dto.goal } : {}),
				...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
			},
			include: {
				metric: true,
			},
		});
		await this.backgroundJobs.enqueueMonthlyMetricSnapshotForOrganization(
			organizationId,
			[metricId],
		);
		return row;
	}
}
