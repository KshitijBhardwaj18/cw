import { BackGroundJobType, InvoiceStatus, type PrismaClient } from "@repo/db";
import {
	BackGroundJobName,
	type BillingCycleRunPayload,
	computeLatestClosedBillingPeriod,
	parseIsoDateOnly,
	toIsoDateOnlyUtc,
} from "@repo/shared";
import type { Queue } from "bullmq";

export async function runBillingCycleRunProcessor(
	prisma: PrismaClient,
	payload: BillingCycleRunPayload,
	billingQueue: Queue,
): Promise<void> {
	const config = await prisma.billingConfig.findFirst({
		where: { organizationId: payload.organizationId, isActive: true },
		select: {
			organizationId: true,
			billingFrequency: true,
			cycleStartDay: true,
		},
	});
	if (!config) return;

	const period = computeLatestClosedBillingPeriod({
		billingFrequency: config.billingFrequency,
		cycleStartDay: config.cycleStartDay,
		referenceDate: new Date(),
	});
	const periodFromStr = toIsoDateOnlyUtc(period.periodFrom);
	const periodToStr = toIsoDateOnlyUtc(period.periodTo);
	const periodFrom = parseIsoDateOnly(periodFromStr);
	const periodTo = parseIsoDateOnly(periodToStr);
	if (!periodFrom || !periodTo) return;

	const existingInvoice = await prisma.invoice.findFirst({
		where: {
			organizationId: payload.organizationId,
			periodStartDate: periodFrom,
			periodEndDate: periodTo,
			status: { not: InvoiceStatus.CANCELLED },
		},
		select: { id: true },
	});
	if (!existingInvoice) {
		const job = await prisma.backGroundJob.create({
			data: {
				type: BackGroundJobType.BILLING_INVOICE_GENERATION,
				payload: {
					organizationId: payload.organizationId,
					periodFrom: periodFromStr,
					periodTo: periodToStr,
				} as object,
				organizationId: payload.organizationId,
			},
			select: { id: true },
		});
		const generatePayload = {
			jobId: job.id,
			organizationId: payload.organizationId,
			periodFrom: periodFromStr,
			periodTo: periodToStr,
		};
		await billingQueue.add(
			BackGroundJobName.BILLING_GENERATE_INVOICES,
			generatePayload,
			{ jobId: job.id },
		);
		await prisma.backGroundJob.update({
			where: { id: job.id },
			data: { payload: generatePayload as object },
		});
	}
}
