import type { PrismaClient } from "@repo/db";
import { BackGroundJobStatus, MissingTimeCaseStatus } from "@repo/db";
import {
	missingTimeReminderTemplate,
	orgMailBranding,
	sendMail,
} from "@repo/mail";
import type {
	TimekeepingBulkReminderJobResult,
	TimekeepingBulkReminderPayload,
	TimekeepingReminderJobResult,
	TimekeepingReminderPayload,
} from "@repo/shared";
import { config } from "../config.js";

export async function runTimekeepingReminderProcessor(
	prisma: PrismaClient,
	payload: TimekeepingReminderPayload,
): Promise<void> {
	const { jobId, candidateEmail, candidateName, workDate, organizationId } =
		payload;

	const org = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { name: true, slug: true, logo: true },
	});

	const orgName = org?.name ?? "Your Organization";
	const portalUrl = buildOrgPortalUrl(org?.slug ?? "");

	const branding = orgMailBranding({
		orgName,
		orgLogoUrl: org?.logo,
		staffLogicLogoUrl: config.mail.staffLogicLogoUrl,
		portal: "candidate",
	});

	try {
		const { subject, text, html } = missingTimeReminderTemplate(
			branding,
			candidateName,
			workDate,
			portalUrl,
		);
		await sendMail(config.mail, { to: candidateEmail, subject, text, html });

		const jobResult: TimekeepingReminderJobResult = { sent: true };
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.COMPLETED,
				result: jobResult as object,
				completedAt: new Date(),
			},
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "Failed to send email";
		const jobResult: TimekeepingReminderJobResult = {
			sent: false,
			error: message,
		};
		await prisma.backGroundJob.update({
			where: { id: jobId },
			data: {
				status: BackGroundJobStatus.FAILED,
				result: jobResult as object,
				completedAt: new Date(),
			},
		});
		throw err;
	}
}

export async function runTimekeepingBulkReminderProcessor(
	prisma: PrismaClient,
	payload: TimekeepingBulkReminderPayload,
): Promise<void> {
	const { jobId, organizationId, caseIds } = payload;

	await prisma.backGroundJob.update({
		where: { id: jobId },
		data: { status: BackGroundJobStatus.PROCESSING },
	});

	const org = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: { name: true, slug: true, logo: true },
	});

	const orgName = org?.name ?? "Your Organization";
	const portalUrl = buildOrgPortalUrl(org?.slug ?? "");

	const cases = await prisma.missingTimeCase.findMany({
		where: { id: { in: caseIds } },
		select: {
			id: true,
			workDate: true,
			status: true,
			candidate: {
				select: { user: { select: { email: true, name: true } } },
			},
		},
	});

	const result: TimekeepingBulkReminderJobResult = {
		sent: 0,
		failed: 0,
		errors: [],
	};

	const branding = orgMailBranding({
		orgName,
		orgLogoUrl: org?.logo,
		staffLogicLogoUrl: config.mail.staffLogicLogoUrl,
		portal: "candidate",
	});

	for (const mc of cases) {
		const email = mc.candidate.user.email;
		const name = mc.candidate.user.name ?? email;
		const workDate =
			mc.workDate.toISOString().split("T")[0] ?? mc.workDate.toISOString();

		try {
			const { subject, text, html } = missingTimeReminderTemplate(
				branding,
				name,
				workDate,
				portalUrl,
			);
			await sendMail(config.mail, { to: email, subject, text, html });
			result.sent += 1;

			await prisma.missingTimeCase.update({
				where: { id: mc.id },
				data: {
					status: MissingTimeCaseStatus.REMINDED,
					lastRemindedAt: new Date(),
				},
			});
		} catch (err) {
			result.failed += 1;
			result.errors.push({
				caseId: mc.id,
				email,
				message: err instanceof Error ? err.message : "Failed to send",
			});
		}
	}

	await prisma.backGroundJob.update({
		where: { id: jobId },
		data: {
			status:
				result.failed === 0
					? BackGroundJobStatus.COMPLETED
					: BackGroundJobStatus.FAILED,
			result: result as object,
			completedAt: new Date(),
		},
	});
}

function buildOrgPortalUrl(slug: string): string {
	const base = config.orgPortalBaseUrl;
	if (!slug) return `${base}/timekeeping`;
	try {
		const url = new URL(base);
		url.hostname = `${slug}.${url.hostname}`;
		return `${url.origin}/timekeeping`;
	} catch {
		return `${base}/timekeeping`;
	}
}
