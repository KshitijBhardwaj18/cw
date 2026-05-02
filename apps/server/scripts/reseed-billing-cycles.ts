import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@repo/db";
import {
	BackGroundJobName,
	BILLING_QUEUE,
	computeNextBillingRunAt,
	monthlyCronPatternFromUtcDate,
} from "@repo/shared";
import { Queue } from "bullmq";
import { config } from "../src/common/config";

function billingCycleScheduleId(organizationId: string): string {
	return `billing-cycle-${organizationId}`;
}

async function run() {
	const adapter = new PrismaPg({
		connectionString: config.urls.db,
		ssl:
			config.environment === "production"
				? { rejectUnauthorized: false }
				: false,
	});
	const prisma = new PrismaClient({ adapter });
	const billingQueue = new Queue(BILLING_QUEUE, {
		connection: { url: config.redis.url },
	});
	try {
		const configs = await prisma.billingConfig.findMany({
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
				const scheduleId = billingCycleScheduleId(cfg.organizationId);
				try {
					await billingQueue.removeJobScheduler(scheduleId);
				} catch {
					// Ignore if scheduler does not exist.
				}

				const firstRunAt = computeNextBillingRunAt({
					billingFrequency: cfg.billingFrequency,
					cycleStartDay: cfg.cycleStartDay,
				});
				const payload = { organizationId: cfg.organizationId };
				if (cfg.billingFrequency === "monthly") {
					const pattern = monthlyCronPatternFromUtcDate(firstRunAt);
					await billingQueue.add(BackGroundJobName.BILLING_CYCLE_RUN, payload, {
						jobId: scheduleId,
						repeat: {
							pattern,
							tz: "UTC",
						},
					});
				} else {
					const intervalMs =
						cfg.billingFrequency === "bi_weekly"
							? 14 * 24 * 60 * 60 * 1000
							: 7 * 24 * 60 * 60 * 1000;
					await billingQueue.add(BackGroundJobName.BILLING_CYCLE_RUN, payload, {
						jobId: scheduleId,
						repeat: {
							every: intervalMs,
							startDate: firstRunAt,
						},
					});
				}
				scheduled += 1;
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unknown error";
				errors.push({ organizationId: cfg.organizationId, message });
			}
		}
		const result = {
			scanned: configs.length,
			scheduled,
			failed: errors.length,
			errors,
		};
		console.log(
			`Billing cycle reseed done. scanned=${result.scanned} scheduled=${result.scheduled} failed=${result.failed}`,
		);
		if (result.failed > 0) {
			for (const error of result.errors) {
				console.error(`org=${error.organizationId} error=${error.message}`);
			}
			process.exitCode = 1;
		}
	} finally {
		await billingQueue.close();
		await prisma.$disconnect();
	}
}

run().catch((error) => {
	console.error("Billing cycle reseed failed:", error);
	process.exit(1);
});
