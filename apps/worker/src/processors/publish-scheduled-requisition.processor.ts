import type { PrismaClient } from "@repo/db";
import { PublishMode, RequisitionStatus } from "@repo/db";
import type { PublishScheduledRequisitionPayload } from "@repo/shared";

/** Allow jobs slightly early (clock / Redis timing); skip if publish time is still far in the future. */
const EARLY_SKEW_MS = 120_000;

export async function runPublishScheduledRequisitionProcessor(
	prisma: PrismaClient,
	payload: PublishScheduledRequisitionPayload,
): Promise<void> {
	const { requisitionId } = payload;
	const row = await prisma.requisition.findUnique({
		where: { id: requisitionId },
		select: {
			id: true,
			status: true,
			publishMode: true,
			scheduledPublishAt: true,
		},
	});
	if (!row) return;
	if (
		row.status !== RequisitionStatus.ACTIVE &&
		row.status !== RequisitionStatus.APPROVED
	) {
		return;
	}
	if (row.publishMode !== PublishMode.SCHEDULED) return;
	if (!row.scheduledPublishAt) return;

	const now = new Date();
	if (row.scheduledPublishAt.getTime() > now.getTime() + EARLY_SKEW_MS) {
		return;
	}

	await prisma.requisition.update({
		where: { id: row.id },
		data: {
			status: RequisitionStatus.PUBLISHED,
			publishedAt: now,
			publishMode: PublishMode.PUBLISH_IMMEDIATELY,
		},
	});
}
