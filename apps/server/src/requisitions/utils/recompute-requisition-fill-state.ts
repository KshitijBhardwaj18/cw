import {
	type Prisma,
	type PrismaClient,
	RequisitionStatus,
	SubmissionStage,
} from "@repo/db";

type PrismaLike = Prisma.TransactionClient | PrismaClient;

const STATUSES_LOCKED_BY_LIFECYCLE: ReadonlySet<RequisitionStatus> = new Set([
	RequisitionStatus.DRAFT,
	RequisitionStatus.CANCELLED,
	RequisitionStatus.PENDING_APPROVAL,
]);

/**
 * Re-syncs `Requisition.positionsFilled` and `Requisition.status` from the
 * authoritative submission state. Counts submissions in `ACCEPTED` for the
 * given requisition; if that meets `numberOfPositions`, status flips to
 * `FILLED`; if it later drops below, a previously-FILLED requisition is
 * reopened to `PUBLISHED`.
 *
 * Lifecycle-locked statuses (DRAFT, CANCELLED, CLOSED, PENDING_APPROVAL) are
 * never auto-flipped — they are explicit user intents.
 *
 * Call this whenever a submission stage changes (accept / withdraw / reject)
 * so the requisition's open/filled view stays accurate.
 */
export async function recomputeRequisitionFillState(
	prisma: PrismaLike,
	requisitionId: string,
): Promise<void> {
	const req = await prisma.requisition.findUnique({
		where: { id: requisitionId },
		select: {
			numberOfPositions: true,
			positionsFilled: true,
			status: true,
		},
	});
	if (!req) return;

	const acceptedCount = await prisma.submission.count({
		where: { requisitionId, stage: SubmissionStage.ACCEPTED },
	});

	let nextStatus: RequisitionStatus = req.status;
	if (!STATUSES_LOCKED_BY_LIFECYCLE.has(req.status)) {
		if (acceptedCount >= req.numberOfPositions) {
			nextStatus = RequisitionStatus.FILLED;
		} else if (req.status === RequisitionStatus.FILLED) {
			// Drop below capacity (e.g. acceptance withdrawn) — reopen.
			nextStatus = RequisitionStatus.PUBLISHED;
		}
	}

	const positionsChanged = acceptedCount !== req.positionsFilled;
	const statusChanged = nextStatus !== req.status;
	if (!positionsChanged && !statusChanged) return;

	await prisma.requisition.update({
		where: { id: requisitionId },
		data: {
			...(positionsChanged ? { positionsFilled: acceptedCount } : {}),
			...(statusChanged ? { status: nextStatus } : {}),
		},
	});
}
