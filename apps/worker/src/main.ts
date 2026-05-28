import {
	BackGroundJobName,
	BILLING_QUEUE,
	type BillingCycleRunPayload,
	type BillingGenerateInvoicesPayload,
	type BulkEnrollmentFilePayload,
	type BulkPlatformUsersFilePayload,
	IMPORTS_QUEUE,
	type InviteBulkPayload,
	type InviteCandidatePayload,
	type InviteSinglePayload,
	METRICS_QUEUE,
	type MetricSnapshotRecomputePayload,
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
import { type Job, Queue, Worker } from "bullmq";
import { config } from "./config.js";
import { createPrismaClient } from "./prisma.js";
import {
	runBillingCycleRunProcessor,
	runBillingGenerateInvoicesProcessor,
	runBulkEnrollmentProcessor,
	runBulkPlatformUsersProcessor,
	runExpirePastPerDiemShiftsProcessor,
	runInviteBulkProcessor,
	runInviteCandidateProcessor,
	runInviteSingleProcessor,
	runMetricSnapshotRecomputeProcessor,
	runPublishScheduledRequisitionProcessor,
	runReconcileSummariesProcessor,
	runRollPlacementStatusesProcessor,
	runSummaryRecomputeProcessor,
	runTimekeepingBulkReminderProcessor,
	runTimekeepingReminderProcessor,
	runTimekeepingUploadProcessor,
	runVendorOnboardingReminderEmailProcessor,
} from "./processors/index.js";
import { createS3Client, getS3Bucket } from "./s3.js";

const connection = { url: config.redis.url };

async function run() {
	const prisma = await createPrismaClient();
	const s3 = createS3Client();
	const bucket = getS3Bucket();
	const billingQueue = new Queue(BILLING_QUEUE, { connection });
	const metricsQueue = new Queue(METRICS_QUEUE, { connection });
	const summaryPlacementQueue = new Queue(SUMMARY_PLACEMENT_QUEUE, {
		connection,
	});
	const summaryCandidateQueue = new Queue(SUMMARY_CANDIDATE_QUEUE, {
		connection,
	});

	for (const staleSchedulerId of [
		"metric-snapshot-monthly-all-orgs",
		"metric-snapshot-daily-open-DAILY",
		"metric-snapshot-daily-open-WEEKLY",
	]) {
		try {
			await metricsQueue.removeJobScheduler(staleSchedulerId);
		} catch {
			// no-op
		}
	}

	// Recompute OrganizationMetricSnapshot once per day at 02:00 UTC for the current MONTHLY bucket.
	await metricsQueue.add(
		BackGroundJobName.METRIC_SNAPSHOT_RECOMPUTE,
		{ periodType: "MONTHLY" } satisfies MetricSnapshotRecomputePayload,
		{
			jobId: "metric-snapshot-daily-open-MONTHLY",
			repeat: { pattern: "0 2 * * *", tz: "UTC" },
			removeOnComplete: 10,
			removeOnFail: false,
		},
	);

	// Self-heal reconciliation: enqueue summary recomputes for any placement / candidate whose PlacementSummary / CandidateSummary is missing or older than 24h.
	await metricsQueue.add(
		BackGroundJobName.RECONCILE_SUMMARIES,
		{},
		{
			jobId: "reconcile-summaries-daily",
			repeat: { pattern: "0 3 * * *", tz: "UTC" },
			removeOnComplete: 10,
			removeOnFail: false,
		},
	);

	// Daily at 00:05 UTC: mark every OPEN per-diem shift whose date has passed as EXPIRED.
	await metricsQueue.add(
		BackGroundJobName.EXPIRE_PAST_PER_DIEM_SHIFTS,
		{},
		{
			jobId: "expire-past-per-diem-shifts-daily",
			repeat: { pattern: "5 0 * * *", tz: "UTC" },
			removeOnComplete: 10,
			removeOnFail: false,
		},
	);

	// Daily at 00:10 UTC: flip UPCOMING placements whose startDate has arrived
	// to ACTIVE. Keeps the placement.status column authoritative so callers that
	// read raw status (badges, reports, billing) don't see stale UPCOMING rows.
	await metricsQueue.add(
		BackGroundJobName.ROLL_PLACEMENT_STATUSES,
		{},
		{
			jobId: "roll-placement-statuses-daily",
			repeat: { pattern: "10 0 * * *", tz: "UTC" },
			removeOnComplete: 10,
			removeOnFail: false,
		},
	);

	const withMainLogs = (
		queueName: string,
		handler: (job: Job) => Promise<void>,
	) => {
		return async (job: Job) => {
			const start = Date.now();
			console.log(
				`[worker:${queueName}] started jobId=${job.id} name=${job.name}`,
			);
			try {
				await handler(job);
				console.log(
					`[worker:${queueName}] completed jobId=${job.id} name=${job.name} durationMs=${Date.now() - start}`,
				);
			} catch (err) {
				console.error(
					`[worker:${queueName}] failed jobId=${job?.id} name=${job?.name}:`,
					err instanceof Error ? err.message : err,
				);
				throw err;
			}
		};
	};

	const importsWorker = new Worker(
		IMPORTS_QUEUE,
		withMainLogs(IMPORTS_QUEUE, async (job) => {
			switch (job.name) {
				case BackGroundJobName.BULK_ENROLLMENT:
					await runBulkEnrollmentProcessor(
						prisma,
						s3,
						bucket,
						job.data as BulkEnrollmentFilePayload,
					);
					break;
				case BackGroundJobName.BULK_PLATFORM_USERS:
					await runBulkPlatformUsersProcessor(
						prisma,
						s3,
						bucket,
						job.data as BulkPlatformUsersFilePayload,
					);
					break;
				case BackGroundJobName.TIMEKEEPING_INTERNAL_UPLOAD:
					await runTimekeepingUploadProcessor(
						prisma,
						s3,
						bucket,
						job.data as TimekeepingInternalUploadPayload,
					);
					break;
				default:
					throw new Error(`Unknown job: ${job.name}`);
			}
		}),
		{ concurrency: 30, connection },
	);

	const billingWorker = new Worker(
		BILLING_QUEUE,
		withMainLogs(BILLING_QUEUE, async (job) => {
			switch (job.name) {
				case BackGroundJobName.BILLING_GENERATE_INVOICES:
					await runBillingGenerateInvoicesProcessor(
						prisma,
						job.data as BillingGenerateInvoicesPayload,
					);
					break;
				case BackGroundJobName.BILLING_CYCLE_RUN:
					await runBillingCycleRunProcessor(
						prisma,
						job.data as BillingCycleRunPayload,
						billingQueue,
					);
					break;
				default:
					throw new Error(`Unknown job: ${job.name}`);
			}
		}),
		{ concurrency: 10, connection },
	);

	const summaryJobHandler = async (job: { name: string; data: unknown }) => {
		if (job.name !== BackGroundJobName.RECOMPUTE_SUMMARY) {
			throw new Error(`Unknown job: ${job.name}`);
		}
		await runSummaryRecomputeProcessor(
			prisma,
			job.data as SummaryRecomputePayload,
		);
	};

	const summaryPlacementWorker = new Worker(
		SUMMARY_PLACEMENT_QUEUE,
		withMainLogs(SUMMARY_PLACEMENT_QUEUE, summaryJobHandler),
		{ concurrency: 10, connection },
	);

	const summaryCandidateWorker = new Worker(
		SUMMARY_CANDIDATE_QUEUE,
		withMainLogs(SUMMARY_CANDIDATE_QUEUE, summaryJobHandler),
		{ concurrency: 10, connection },
	);

	const summaryTimekeepingWorker = new Worker(
		SUMMARY_TIMEKEEPING_QUEUE,
		withMainLogs(SUMMARY_TIMEKEEPING_QUEUE, summaryJobHandler),
		{ concurrency: 20, connection },
	);

	const metricsWorker = new Worker(
		METRICS_QUEUE,
		withMainLogs(METRICS_QUEUE, async (job) => {
			switch (job.name) {
				case BackGroundJobName.METRIC_SNAPSHOT_RECOMPUTE:
					await runMetricSnapshotRecomputeProcessor(
						prisma,
						job.data as MetricSnapshotRecomputePayload,
					);
					break;
				case BackGroundJobName.RECONCILE_SUMMARIES:
					await runReconcileSummariesProcessor(prisma, {
						summaryPlacementQueue,
						summaryCandidateQueue,
					});
					break;
				case BackGroundJobName.EXPIRE_PAST_PER_DIEM_SHIFTS:
					await runExpirePastPerDiemShiftsProcessor(prisma);
					break;
				case BackGroundJobName.ROLL_PLACEMENT_STATUSES:
					await runRollPlacementStatusesProcessor(prisma);
					break;
				default:
					throw new Error(`Unknown job: ${job.name}`);
			}
		}),
		{ concurrency: 8, connection },
	);

	const notificationsWorker = new Worker(
		NOTIFICATIONS_QUEUE,
		withMainLogs(NOTIFICATIONS_QUEUE, async (job) => {
			switch (job.name) {
				case BackGroundJobName.SEND_INVITE_SINGLE:
					await runInviteSingleProcessor(
						prisma,
						job.data as InviteSinglePayload,
					);
					break;
				case BackGroundJobName.SEND_INVITE_BULK:
					await runInviteBulkProcessor(prisma, job.data as InviteBulkPayload);
					break;
				case BackGroundJobName.SEND_INVITE_CANDIDATE:
					await runInviteCandidateProcessor(
						prisma,
						job.data as InviteCandidatePayload,
					);
					break;
				case BackGroundJobName.TIMEKEEPING_SEND_REMINDER: {
					const data = job.data as
						| TimekeepingReminderPayload
						| TimekeepingBulkReminderPayload;
					if ("caseIds" in data) {
						await runTimekeepingBulkReminderProcessor(
							prisma,
							data as TimekeepingBulkReminderPayload,
						);
					} else {
						await runTimekeepingReminderProcessor(
							prisma,
							data as TimekeepingReminderPayload,
						);
					}
					break;
				}
				case BackGroundJobName.VENDOR_ONBOARDING_REMINDER:
					await runVendorOnboardingReminderEmailProcessor(
						prisma,
						job.data as VendorOnboardingReminderPayload,
					);
					break;
				default:
					throw new Error(`Unknown job: ${job.name}`);
			}
		}),
		{ concurrency: 20, connection },
	);

	const requisitionsWorker = new Worker(
		REQUISITIONS_QUEUE,
		withMainLogs(REQUISITIONS_QUEUE, async (job) => {
			switch (job.name) {
				case BackGroundJobName.PUBLISH_SCHEDULED_REQUISITION:
					await runPublishScheduledRequisitionProcessor(
						prisma,
						job.data as PublishScheduledRequisitionPayload,
					);
					break;
				default:
					throw new Error(`Unknown job: ${job.name}`);
			}
		}),
		{ concurrency: 20, connection },
	);

	const shutdown = async () => {
		await Promise.all([
			billingQueue.close(),
			metricsQueue.close(),
			summaryPlacementQueue.close(),
			summaryCandidateQueue.close(),
			importsWorker.close(),
			billingWorker.close(),
			notificationsWorker.close(),
			requisitionsWorker.close(),
			summaryPlacementWorker.close(),
			summaryCandidateWorker.close(),
			summaryTimekeepingWorker.close(),
			metricsWorker.close(),
		]);
		await prisma.$disconnect();
		process.exit(0);
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);

	console.log(
		`[worker] Listening on queues "${IMPORTS_QUEUE}", "${BILLING_QUEUE}", "${NOTIFICATIONS_QUEUE}", "${REQUISITIONS_QUEUE}", "${SUMMARY_PLACEMENT_QUEUE}", "${SUMMARY_CANDIDATE_QUEUE}", "${SUMMARY_TIMEKEEPING_QUEUE}", "${METRICS_QUEUE}"`,
	);
}

run().catch((err) => {
	console.error("[worker] Fatal:", err);
	process.exit(1);
});
