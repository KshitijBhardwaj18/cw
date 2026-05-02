import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import {
	BILLING_QUEUE,
	IMPORTS_QUEUE,
	METRICS_QUEUE,
	NOTIFICATIONS_QUEUE,
	REQUISITIONS_QUEUE,
	SUMMARY_CANDIDATE_QUEUE,
	SUMMARY_PLACEMENT_QUEUE,
	SUMMARY_TIMEKEEPING_QUEUE,
} from "@repo/shared";
import { config } from "src/common/config";
import { PrismaModule } from "src/prisma/prisma.module";
import { BackgroundJobsService } from "./background-jobs.service";
import { BulkEnrollmentEventsService } from "./bulk-enrollment-events.service";

@Module({
	imports: [
		PrismaModule,
		BullModule.forRoot({
			connection: {
				url: config.redis.url,
			},
		}),
		BullModule.registerQueue(
			{
				name: IMPORTS_QUEUE,
				defaultJobOptions: {
					attempts: 3,
					backoff: { type: "exponential", delay: 1000 },
					removeOnComplete: { count: 1000 },
				},
			},
			{
				name: BILLING_QUEUE,
				defaultJobOptions: {
					attempts: 3,
					backoff: { type: "exponential", delay: 1000 },
					removeOnComplete: { count: 1000 },
				},
			},
			{
				name: NOTIFICATIONS_QUEUE,
				defaultJobOptions: {
					attempts: 3,
					backoff: { type: "exponential", delay: 2000 },
					removeOnComplete: { count: 1000 },
				},
			},
			{
				name: REQUISITIONS_QUEUE,
				defaultJobOptions: {
					attempts: 3,
					backoff: { type: "exponential", delay: 5000 },
					removeOnComplete: { count: 2000 },
				},
			},
			{
				name: METRICS_QUEUE,
				defaultJobOptions: {
					attempts: 3,
					backoff: { type: "exponential", delay: 1000 },
					removeOnComplete: { count: 2000 },
				},
			},
			{
				name: SUMMARY_PLACEMENT_QUEUE,
				defaultJobOptions: {
					attempts: 3,
					backoff: { type: "exponential", delay: 1000 },
					removeOnComplete: { count: 2000 },
				},
			},
			{
				name: SUMMARY_CANDIDATE_QUEUE,
				defaultJobOptions: {
					attempts: 3,
					backoff: { type: "exponential", delay: 1000 },
					removeOnComplete: { count: 2000 },
				},
			},
			{
				name: SUMMARY_TIMEKEEPING_QUEUE,
				defaultJobOptions: {
					attempts: 3,
					backoff: { type: "exponential", delay: 1000 },
					removeOnComplete: { count: 2000 },
				},
			},
		),
	],
	providers: [BackgroundJobsService, BulkEnrollmentEventsService],
	exports: [BackgroundJobsService, BulkEnrollmentEventsService],
})
export class BackgroundJobsModule {}
