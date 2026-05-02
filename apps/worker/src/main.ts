import {
	BackGroundJobName,
	BILLING_QUEUE,
	type BillingCycleRunPayload,
	type BillingGenerateInvoicesPayload,
	type BillingRefreshSpendAnalyticsPayload,
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
	runBillingRefreshSpendAnalyticsProcessor,
	runBulkEnrollmentProcessor,
	runBulkPlatformUsersProcessor,
	runInviteBulkProcessor,
	runInviteCandidateProcessor,
	runInviteSingleProcessor,
	runMetricSnapshotRecomputeProcessor,
	runPublishScheduledRequisitionProcessor,
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
						billingQueue,
					);
					break;
				case BackGroundJobName.BILLING_CYCLE_RUN:
					await runBillingCycleRunProcessor(
						prisma,
						job.data as BillingCycleRunPayload,
						billingQueue,
					);
					break;
				case BackGroundJobName.BILLING_REFRESH_SPEND_ANALYTICS:
					await runBillingRefreshSpendAnalyticsProcessor(
						prisma,
						job.data as BillingRefreshSpendAnalyticsPayload,
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
