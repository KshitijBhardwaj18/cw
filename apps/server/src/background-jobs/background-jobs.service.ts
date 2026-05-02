import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { BackGroundJobType } from "@repo/db";
import {
	BackGroundJobName,
	BILLING_QUEUE,
	type BillingCycleRunPayload,
	type BulkEnrollmentFilePayload,
	type BulkPlatformUsersFilePayload,
	computeNextBillingRunAt,
	IMPORTS_QUEUE,
	type InviteBulkPayload,
	type InviteCandidatePayload,
	type InviteSinglePayload,
	METRICS_QUEUE,
	type MetricSnapshotRecomputePayload,
	monthlyCronPatternFromUtcDate,
	NOTIFICATIONS_QUEUE,
	type PublishScheduledRequisitionPayload,
	REQUISITIONS_QUEUE,
	SUMMARY_CANDIDATE_QUEUE,
	SUMMARY_PLACEMENT_QUEUE,
	SUMMARY_TIMEKEEPING_QUEUE,
	type SummaryRecomputePayload,
	type TimekeepingBulkReminderPayload,
	type TimekeepingInternalUploadPayload,
	type TimekeepingReminderPayload,
	type VendorOnboardingReminderPayload,
} from "@repo/shared";
import { Queue } from "bullmq";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BackgroundJobsService {
	private readonly logger = new Logger(BackgroundJobsService.name);

	constructor(
		private readonly prisma: PrismaService,
		@InjectQueue(IMPORTS_QUEUE) private readonly importsQueue: Queue,
		@InjectQueue(BILLING_QUEUE) private readonly billingQueue: Queue,
		@InjectQueue(NOTIFICATIONS_QUEUE)
		private readonly notificationsQueue: Queue,
		@InjectQueue(REQUISITIONS_QUEUE)
		private readonly requisitionsQueue: Queue,
		@InjectQueue(METRICS_QUEUE) private readonly metricsQueue: Queue,
		@InjectQueue(SUMMARY_PLACEMENT_QUEUE)
		private readonly summaryPlacementQueue: Queue,
		@InjectQueue(SUMMARY_CANDIDATE_QUEUE)
		private readonly summaryCandidateQueue: Queue,
		@InjectQueue(SUMMARY_TIMEKEEPING_QUEUE)
		private readonly summaryTimekeepingQueue: Queue,
	) {}

	private static requisitionPublishJobId(requisitionId: string): string {
		return `publish-req-${requisitionId}`;
	}

	private static summaryRecomputeJobId(
		payload: SummaryRecomputePayload,
	): string {
		switch (payload.kind) {
			case "candidate":
				return `candidate-${payload.candidateId}`;
			case "placement":
				return `placement-${payload.placementId}`;
			case "timekeeping-week":
				return `timekeeping-week-${payload.organizationId}-${payload.weekEndingDate.replaceAll(":", "_")}`;
		}
	}

	private static billingCycleScheduleId(organizationId: string): string {
		return `billing-cycle-${organizationId}`;
	}

	private async clearBillingCycleSchedules(
		organizationId: string,
	): Promise<void> {
		const scheduleId =
			BackgroundJobsService.billingCycleScheduleId(organizationId);
		try {
			await this.billingQueue.removeJobScheduler(scheduleId);
		} catch {
			// Ignore if scheduler doesn't exist yet.
		}
	}

	async scheduleBillingCycleRun(input: {
		organizationId: string;
		billingFrequency: string | null | undefined;
		cycleStartDay: string | null | undefined;
	}) {
		await this.clearBillingCycleSchedules(input.organizationId);
		const now = new Date();
		const firstRunAt = computeNextBillingRunAt({
			billingFrequency: input.billingFrequency,
			cycleStartDay: input.cycleStartDay,
			fromDate: now,
		});
		const cyclePayload: BillingCycleRunPayload = {
			organizationId: input.organizationId,
		};
		const scheduleId = BackgroundJobsService.billingCycleScheduleId(
			input.organizationId,
		);

		if (input.billingFrequency === "monthly") {
			const pattern = monthlyCronPatternFromUtcDate(firstRunAt);
			await this.billingQueue.add(
				BackGroundJobName.BILLING_CYCLE_RUN,
				cyclePayload,
				{
					jobId: scheduleId,
					repeat: {
						pattern,
						tz: "UTC",
					},
				},
			);
			this.logger.warn(
				`Billing scheduler set: org=${input.organizationId} scheduleId=${scheduleId} mode=monthly-cron pattern="${pattern}"`,
			);
			return;
		}

		const intervalMs =
			input.billingFrequency === "bi_weekly"
				? 14 * 24 * 60 * 60 * 1000
				: 7 * 24 * 60 * 60 * 1000;
		await this.billingQueue.add(
			BackGroundJobName.BILLING_CYCLE_RUN,
			cyclePayload,
			{
				jobId: scheduleId,
				repeat: {
					every: intervalMs,
					startDate: firstRunAt,
				},
			},
		);
		this.logger.warn(
			`Billing scheduler set: org=${input.organizationId} scheduleId=${scheduleId} mode=interval everyMs=${intervalMs} startAt=${firstRunAt.toISOString()}`,
		);
	}

	async enqueueBillingCycleRunNow(organizationId: string) {
		return this.billingQueue.add(BackGroundJobName.BILLING_CYCLE_RUN, {
			organizationId,
		});
	}

	async rescheduleAllBillingCycles() {
		const configs = await this.prisma.billingConfig.findMany({
			where: { isActive: true },
			select: {
				organizationId: true,
				billingFrequency: true,
				cycleStartDay: true,
			},
		});
		const errors: Array<{ organizationId: string; message: string }> = [];
		let scheduled = 0;
		for (const cfg of configs) {
			try {
				await this.scheduleBillingCycleRun({
					organizationId: cfg.organizationId,
					billingFrequency: cfg.billingFrequency,
					cycleStartDay: cfg.cycleStartDay,
				});
				scheduled += 1;
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unknown error";
				errors.push({ organizationId: cfg.organizationId, message });
			}
		}
		return {
			scanned: configs.length,
			scheduled,
			failed: errors.length,
			errors,
		};
	}

	async cancelScheduledRequisitionPublish(
		requisitionId: string,
	): Promise<void> {
		const jobId = BackgroundJobsService.requisitionPublishJobId(requisitionId);
		const job = await this.requisitionsQueue.getJob(jobId);
		if (job) {
			await job.remove();
		}
	}

	async scheduleRequisitionPublish(
		requisitionId: string,
		scheduledAt: Date,
	): Promise<void> {
		await this.cancelScheduledRequisitionPublish(requisitionId);
		const delay = Math.max(0, scheduledAt.getTime() - Date.now());
		const payload: PublishScheduledRequisitionPayload = { requisitionId };
		await this.requisitionsQueue.add(
			BackGroundJobName.PUBLISH_SCHEDULED_REQUISITION,
			payload,
			{
				jobId: BackgroundJobsService.requisitionPublishJobId(requisitionId),
				delay,
			},
		);
	}

	async enqueueSummaryRecompute(
		payload: SummaryRecomputePayload,
	): Promise<void> {
		const queue =
			payload.kind === "placement"
				? this.summaryPlacementQueue
				: payload.kind === "candidate"
					? this.summaryCandidateQueue
					: this.summaryTimekeepingQueue;
		const jobId = BackgroundJobsService.summaryRecomputeJobId(payload);
		await queue.add(BackGroundJobName.RECOMPUTE_SUMMARY, payload, { jobId });
	}

	async enqueueCandidateSummary(candidateId: string): Promise<void> {
		await this.enqueueSummaryRecompute({ kind: "candidate", candidateId });
	}

	async enqueuePlacementSummary(placementId: string): Promise<void> {
		await this.enqueueSummaryRecompute({ kind: "placement", placementId });
	}

	async enqueueTimekeepingWeekSummary(
		organizationId: string,
		weekEndingDate: string,
	): Promise<void> {
		await this.enqueueSummaryRecompute({
			kind: "timekeeping-week",
			organizationId,
			weekEndingDate,
		});
	}

	async enqueueMetricSnapshotRecompute(
		payload: MetricSnapshotRecomputePayload,
	): Promise<{ jobId: string }> {
		const jobId = `metric-snapshot-${payload.organizationId}-${payload.periodType}-${Date.now()}`;
		const job = await this.metricsQueue.add(
			BackGroundJobName.METRIC_SNAPSHOT_RECOMPUTE,
			payload,
			{
				jobId,
				attempts: 3,
				backoff: { type: "exponential", delay: 2_000 },
				removeOnComplete: 1000,
				removeOnFail: false,
			},
		);
		return { jobId: String(job.id) };
	}

	async enqueueMonthlyMetricSnapshotForOrganization(
		organizationId: string,
		metricIds?: string[],
	): Promise<void> {
		await this.enqueueMetricSnapshotRecompute({
			organizationId,
			periodType: "MONTHLY",
			metricIds,
		});
	}

	async enqueueCredentialExpirySummaryForPlacement(
		placementId: string,
	): Promise<void> {
		await this.enqueuePlacementSummary(placementId);
	}

	async enqueueComplianceRelatedSummaries(
		candidateId: string,
		placementId: string,
	): Promise<void> {
		await this.enqueueCandidateSummary(candidateId);
		await this.enqueuePlacementSummary(placementId);
	}

	async enqueueTimekeepingSummariesForOrganization(
		organizationId: string,
	): Promise<void> {
		const fromSummaries = await this.prisma.timekeepingSummary.findMany({
			where: { organizationId },
			select: { weekEndingDate: true },
			distinct: ["weekEndingDate"],
		});
		const weeks =
			fromSummaries.length > 0
				? fromSummaries
				: await this.prisma.timesheet.findMany({
						where: { organizationId },
						select: { weekEndingDate: true },
						distinct: ["weekEndingDate"],
					});
		if (weeks.length === 0) {
			this.logger.warn(
				`enqueueTimekeepingSummariesForOrganization: no weeks found for organizationId=${organizationId} — no timekeeping summary jobs enqueued`,
			);
			return;
		}

		for (const row of weeks) {
			await this.enqueueTimekeepingWeekSummary(
				organizationId,
				row.weekEndingDate.toISOString(),
			);
		}
	}

	async createBulkEnrollmentJob(
		organizationId: string,
		s3Key: string,
		fileName: string,
	) {
		const job = await this.prisma.backGroundJob.create({
			data: {
				type: BackGroundJobType.BULK_ENROLL,
				payload: { s3Key, fileName } as object,
				organizationId,
			},
		});
		const payload: BulkEnrollmentFilePayload = {
			jobId: job.id,
			organizationId,
			s3Key,
			fileName,
		};
		await this.importsQueue.add(BackGroundJobName.BULK_ENROLLMENT, payload, {
			jobId: job.id,
		});
		return job;
	}

	async createBulkPlatformUsersJob(s3Key: string, fileName: string) {
		const job = await this.prisma.backGroundJob.create({
			data: {
				type: BackGroundJobType.BULK_PLATFORM_USERS,
				payload: { s3Key, fileName } as object,
				organizationId: null,
			},
		});
		const payload: BulkPlatformUsersFilePayload = {
			jobId: job.id,
			s3Key,
			fileName,
		};
		await this.importsQueue.add(
			BackGroundJobName.BULK_PLATFORM_USERS,
			payload,
			{ jobId: job.id },
		);
		return job;
	}

	async getJobById(id: string, organizationId?: string) {
		const job = await this.prisma.backGroundJob.findUnique({
			where: { id },
		});
		if (!job) {
			throw new NotFoundException("Job not found");
		}
		if (organizationId != null && job.organizationId !== organizationId) {
			throw new NotFoundException("Job not found");
		}
		return job;
	}

	async createInviteSingleJob(
		organizationId: string,
		memberId: string,
		scheduledAt?: Date,
	) {
		const job = await this.prisma.backGroundJob.create({
			data: {
				type: BackGroundJobType.INVITE_SINGLE,
				payload: { organizationId, memberId } as object,
				organizationId,
				scheduledFor: scheduledAt ?? null,
			},
		});
		const payload: InviteSinglePayload = {
			jobId: job.id,
			organizationId,
			memberId,
		};
		const delay = scheduledAt
			? Math.max(0, scheduledAt.getTime() - Date.now())
			: undefined;
		await this.notificationsQueue.add(
			BackGroundJobName.SEND_INVITE_SINGLE,
			payload,
			{ jobId: job.id, delay },
		);
		await this.prisma.backGroundJob.update({
			where: { id: job.id },
			data: { payload: payload as object },
		});
		return job;
	}

	async createInviteCandidateJob(
		organizationId: string,
		candidateId: string,
		magicLinkUrl: string,
	) {
		const job = await this.prisma.backGroundJob.create({
			data: {
				type: BackGroundJobType.INVITE_CANDIDATE,
				payload: { organizationId, candidateId, magicLinkUrl } as object,
				organizationId,
			},
		});
		const payload: InviteCandidatePayload = {
			jobId: job.id,
			organizationId,
			candidateId,
			magicLinkUrl,
		};
		await this.notificationsQueue.add(
			BackGroundJobName.SEND_INVITE_CANDIDATE,
			payload,
			{ jobId: job.id },
		);
		await this.prisma.backGroundJob.update({
			where: { id: job.id },
			data: { payload: payload as object },
		});
		return job;
	}

	async createTimekeepingReminderJob(
		organizationId: string,
		caseId: string,
		candidateEmail: string,
		candidateName: string,
		workDate: string,
		orgPortalUrl: string,
	) {
		const job = await this.prisma.backGroundJob.create({
			data: {
				type: BackGroundJobType.TIMEKEEPING_REMINDER,
				payload: { organizationId, caseId } as object,
				organizationId,
			},
		});
		const payload: TimekeepingReminderPayload = {
			jobId: job.id,
			organizationId,
			caseId,
			candidateEmail,
			candidateName,
			workDate,
			orgPortalUrl,
		};
		await this.notificationsQueue.add(
			BackGroundJobName.TIMEKEEPING_SEND_REMINDER,
			payload,
			{ jobId: job.id },
		);
		await this.prisma.backGroundJob.update({
			where: { id: job.id },
			data: { payload: payload as object },
		});
		return job;
	}

	async createTimekeepingBulkReminderJob(
		organizationId: string,
		caseIds: string[],
	) {
		const job = await this.prisma.backGroundJob.create({
			data: {
				type: BackGroundJobType.TIMEKEEPING_REMINDER,
				payload: { organizationId, caseIds } as object,
				organizationId,
			},
		});
		const payload: TimekeepingBulkReminderPayload = {
			jobId: job.id,
			organizationId,
			caseIds,
		};
		await this.notificationsQueue.add(
			BackGroundJobName.TIMEKEEPING_SEND_REMINDER,
			payload,
			{ jobId: job.id },
		);
		await this.prisma.backGroundJob.update({
			where: { id: job.id },
			data: { payload: payload as object },
		});
		return job;
	}

	async createTimesheetUploadJob(
		organizationId: string,
		s3Key: string,
		fileName: string,
		uploadedById: string,
	) {
		const job = await this.prisma.backGroundJob.create({
			data: {
				type: BackGroundJobType.TIMEKEEPING_UPLOAD,
				payload: { s3Key, fileName } as object,
				organizationId,
			},
		});
		const payload: TimekeepingInternalUploadPayload = {
			jobId: job.id,
			organizationId,
			s3Key,
			fileName,
			uploadedById,
		};
		await this.importsQueue.add(
			BackGroundJobName.TIMEKEEPING_INTERNAL_UPLOAD,
			payload,
			{ jobId: job.id },
		);
		await this.prisma.backGroundJob.update({
			where: { id: job.id },
			data: { payload: payload as object },
		});
		return job;
	}

	async createInviteBulkJob(
		organizationId: string,
		memberIds: string[],
		scheduledAt?: Date,
	) {
		const job = await this.prisma.backGroundJob.create({
			data: {
				type: BackGroundJobType.INVITE_BULK,
				payload: { organizationId, memberIds } as object,
				organizationId,
				scheduledFor: scheduledAt ?? null,
			},
		});
		const payload: InviteBulkPayload = {
			jobId: job.id,
			organizationId,
			memberIds,
		};
		const delay = scheduledAt
			? Math.max(0, scheduledAt.getTime() - Date.now())
			: undefined;
		await this.notificationsQueue.add(
			BackGroundJobName.SEND_INVITE_BULK,
			payload,
			{ jobId: job.id, delay },
		);
		await this.prisma.backGroundJob.update({
			where: { id: job.id },
			data: { payload: payload as object },
		});
		return job;
	}

	async enqueueVendorOnboardingReminder(
		payload: VendorOnboardingReminderPayload,
	): Promise<void> {
		await this.notificationsQueue.add(
			BackGroundJobName.VENDOR_ONBOARDING_REMINDER,
			payload,
		);
	}
}
