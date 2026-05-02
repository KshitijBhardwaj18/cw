import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from "@nestjs/common";
import { BackGroundJobType } from "@repo/db";
import type { BulkEnrollmentJobResult } from "@repo/shared";
import { IMPORTS_QUEUE } from "@repo/shared";
import { QueueEvents } from "bullmq";
import { Subject } from "rxjs";
import { config } from "src/common/config";
import { PrismaService } from "src/prisma/prisma.service";

export type BulkJobStreamEvent =
	| {
			jobId: string;
			phase: "completed";
			enrolled: number;
			skipped: number;
			failed: number;
			errors?: Array<{ row: number; email?: string; message: string }>;
	  }
	| { jobId: string; phase: "failed"; message: string };

@Injectable()
export class BulkEnrollmentEventsService
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(BulkEnrollmentEventsService.name);
	private queueEvents!: QueueEvents;
	private readonly subject = new Subject<BulkJobStreamEvent>();

	constructor(private readonly prisma: PrismaService) {}

	private isUuid(value: string): boolean {
		return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
			value,
		);
	}

	onModuleInit() {
		this.queueEvents = new QueueEvents(IMPORTS_QUEUE, {
			connection: { url: config.redis.url },
		});

		this.queueEvents.on("completed", async ({ jobId }) => {
			try {
				if (typeof jobId !== "string" || !this.isUuid(jobId)) return;
				const job = await this.prisma.backGroundJob.findUnique({
					where: { id: jobId },
				});
				if (!job || job.type !== BackGroundJobType.BULK_ENROLL) return;

				const r = job.result as BulkEnrollmentJobResult | null;
				this.subject.next({
					jobId,
					phase: "completed",
					enrolled: r?.enrolled ?? 0,
					skipped: r?.skipped ?? 0,
					failed: r?.failed ?? 0,
					errors: r?.errors,
				});
			} catch (err) {
				this.logger.error(
					`Failed to emit completed event for job ${jobId}`,
					err,
				);
			}
		});

		this.queueEvents.on("failed", async ({ jobId, failedReason }) => {
			try {
				if (typeof jobId !== "string" || !this.isUuid(jobId)) return;
				const job = await this.prisma.backGroundJob.findUnique({
					where: { id: jobId },
					select: { id: true, type: true },
				});
				if (!job || job.type !== BackGroundJobType.BULK_ENROLL) return;
				this.subject.next({
					jobId,
					phase: "failed",
					message: failedReason ?? "Job failed",
				});
			} catch (err) {
				this.logger.error(`Failed to emit failed event for job ${jobId}`, err);
			}
		});

		this.queueEvents.on("error", (err) => {
			this.logger.error("QueueEvents error", err);
		});
	}

	async onModuleDestroy() {
		this.subject.complete();
		await this.queueEvents.close();
	}

	get events$() {
		return this.subject.asObservable();
	}
}
