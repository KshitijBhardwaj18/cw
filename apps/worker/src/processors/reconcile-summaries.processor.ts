import type { PrismaClient } from "@repo/db";
import { BackGroundJobName, type SummaryRecomputePayload } from "@repo/shared";
import type { Queue } from "bullmq";

const RECONCILE_PAGE_SIZE = 1000;
const RECONCILE_BULK_CHUNK = 200;
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

/**
 * Self-heal cron: enqueues summary recomputes for placements / candidates
 * whose summary row is either missing or whose `lastComplianceUpdatedAt` is
 * older than 24h. Protects against enqueue events lost between mutation
 * and queue (process crashes, network blips) and guarantees every entity
 * is touched at least daily.
 *
 * Cursor-paginates over the source table (id ascending) so the entire
 * backlog is processed in one nightly run regardless of size. Enqueues
 * in chunks of 200 via `Queue.addBulk` for throughput.
 *
 * Idempotent: jobIds are stable (one per entity), so re-runs deduplicate
 * with any already-pending recompute.
 */
export async function runReconcileSummariesProcessor(
	prisma: PrismaClient,
	queues: {
		summaryPlacementQueue: Queue;
		summaryCandidateQueue: Queue;
	},
): Promise<{
	stalePlacements: number;
	staleCandidates: number;
}> {
	const cutoff = new Date(Date.now() - STALE_AFTER_MS);

	const stalePlacements = await reconcileEntityBacklog<string>({
		fetchPage: async (cursorId) =>
			prisma.placement
				.findMany({
					where: {
						OR: [
							{ summary: null },
							{ summary: { lastComplianceUpdatedAt: null } },
							{ summary: { lastComplianceUpdatedAt: { lt: cutoff } } },
						],
						...(cursorId ? { id: { gt: cursorId } } : {}),
					},
					select: { id: true },
					orderBy: { id: "asc" },
					take: RECONCILE_PAGE_SIZE,
				})
				.then((rows) => rows.map((r) => r.id)),
		enqueueChunk: (ids) =>
			queues.summaryPlacementQueue.addBulk(
				ids.map((id) => ({
					name: BackGroundJobName.RECOMPUTE_SUMMARY,
					data: {
						kind: "placement",
						placementId: id,
					} satisfies SummaryRecomputePayload,
					opts: { jobId: `placement-${id}` },
				})),
			),
	});

	const staleCandidates = await reconcileEntityBacklog<string>({
		fetchPage: async (cursorId) =>
			prisma.candidate
				.findMany({
					where: {
						OR: [
							{ summary: null },
							{ summary: { lastComplianceUpdatedAt: null } },
							{ summary: { lastComplianceUpdatedAt: { lt: cutoff } } },
						],
						...(cursorId ? { id: { gt: cursorId } } : {}),
					},
					select: { id: true },
					orderBy: { id: "asc" },
					take: RECONCILE_PAGE_SIZE,
				})
				.then((rows) => rows.map((r) => r.id)),
		enqueueChunk: (ids) =>
			queues.summaryCandidateQueue.addBulk(
				ids.map((id) => ({
					name: BackGroundJobName.RECOMPUTE_SUMMARY,
					data: {
						kind: "candidate",
						candidateId: id,
					} satisfies SummaryRecomputePayload,
					opts: { jobId: `candidate-${id}` },
				})),
			),
	});

	return { stalePlacements, staleCandidates };
}

async function reconcileEntityBacklog<TId extends string>(params: {
	fetchPage: (cursorId: TId | null) => Promise<TId[]>;
	enqueueChunk: (ids: TId[]) => Promise<unknown>;
}): Promise<number> {
	let total = 0;
	let cursorId: TId | null = null;

	for (;;) {
		const ids = await params.fetchPage(cursorId);
		if (ids.length === 0) break;

		for (let i = 0; i < ids.length; i += RECONCILE_BULK_CHUNK) {
			const chunk = ids.slice(i, i + RECONCILE_BULK_CHUNK);
			await params.enqueueChunk(chunk);
		}

		total += ids.length;
		cursorId = ids[ids.length - 1] ?? null;
		if (ids.length < RECONCILE_PAGE_SIZE) break;
	}

	return total;
}
