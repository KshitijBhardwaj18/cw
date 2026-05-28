import { PlacementStatus, type PrismaClient } from "@repo/db";

/**
 * Nightly cron: flips every UPCOMING placement whose `startDate` has arrived
 * to ACTIVE. Idempotent — re-running flips zero rows once the backlog is
 * drained. ON_HOLD, TERMINATED, ACTIVE, and COMPLETED are never touched.
 *
 * Auto-completion on past `endDate` is intentionally NOT performed here —
 * that's billing-sensitive and should be a separate, deliberate transition.
 */
export async function runRollPlacementStatusesProcessor(
	prisma: PrismaClient,
): Promise<{ activated: number }> {
	const now = new Date();

	const activated = await prisma.placement.updateMany({
		where: {
			status: PlacementStatus.UPCOMING,
			startDate: { not: null, lte: now },
		},
		data: { status: PlacementStatus.ACTIVE },
	});

	return { activated: activated.count };
}
