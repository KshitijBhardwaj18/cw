import { PerDiemShiftStatus, type PrismaClient } from "@repo/db";

/**
 * Nightly cron: marks every OPEN per-diem shift whose `shiftDate` is before
 * today (UTC) as EXPIRED. Idempotent — re-running flips zero rows once the
 * backlog is drained. Only OPEN rows are touched, so claimed (IN_PROGRESS),
 * COMPLETED, or CANCELLED shifts are never affected.
 */
export async function runExpirePastPerDiemShiftsProcessor(
	prisma: PrismaClient,
): Promise<{ expired: number }> {
	const todayStartUtc = new Date();
	todayStartUtc.setUTCHours(0, 0, 0, 0);

	const result = await prisma.perDiemShift.updateMany({
		where: {
			status: PerDiemShiftStatus.OPEN,
			shiftDate: { lt: todayStartUtc },
		},
		data: { status: PerDiemShiftStatus.EXPIRED },
	});

	return { expired: result.count };
}
