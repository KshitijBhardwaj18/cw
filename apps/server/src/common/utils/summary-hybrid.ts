/**
 * Hybrid summary read pattern used by list views.
 *
 * Summary tables (PlacementSummary, CandidateSummary, etc.) are recomputed
 * asynchronously by background workers. For list endpoints we read the summary
 * first, but a missing or stale row must NOT silently fall back to a "good"
 * default — that has produced user-visible correctness bugs (e.g. 100%
 * compliance for placements with no summary yet). Instead we recompute live
 * for the affected keys and fire an async refresh.
 *
 * Concurrent requests for the same stale key are coalesced into one DB
 * compute via an in-process Promise registry (see `coalescedCompute`),
 * preventing thundering-herd spikes after deploys or Redis flushes.
 *
 * Default staleness threshold is 3 minutes. Detail (single-entity) views
 * should compute live directly and ignore the summary.
 */

export const SUMMARY_STALE_AFTER_MS = 3 * 60 * 1000;

export type SummaryEntry<TKey, TValue> = {
	key: TKey;
	value: TValue;
	computedAt: Date | null;
};

export function isSummaryFresh(
	computedAt: Date | null | undefined,
	staleAfterMs: number = SUMMARY_STALE_AFTER_MS,
): boolean {
	if (!computedAt) return false;
	return Date.now() - computedAt.getTime() < staleAfterMs;
}

export async function hybridSummaryFetch<TKey, TValue>(params: {
	/**
	 * Globally-unique label for this read site, e.g. `"placement-compliance"`
	 * or `"wallet-stats"`. Used by the coalescer so concurrent requests for
	 * the same (scope, key) share one live-compute call.
	 */
	scope: string;
	keys: TKey[];
	fetchSummaries: (keys: TKey[]) => Promise<SummaryEntry<TKey, TValue>[]>;
	computeLive: (staleKeys: TKey[]) => Promise<Map<TKey, TValue>>;
	staleAfterMs?: number;
	onStale?: (staleKeys: TKey[]) => void;
}): Promise<Map<TKey, TValue>> {
	const { scope, keys, fetchSummaries, computeLive, onStale } = params;
	const staleAfterMs = params.staleAfterMs ?? SUMMARY_STALE_AFTER_MS;
	const out = new Map<TKey, TValue>();
	if (keys.length === 0) return out;

	const summaries = await fetchSummaries(keys);
	const summariesByKey = new Map(summaries.map((s) => [s.key, s]));

	const staleKeys: TKey[] = [];
	for (const key of keys) {
		const entry = summariesByKey.get(key);
		if (entry && isSummaryFresh(entry.computedAt, staleAfterMs)) {
			out.set(key, entry.value);
		} else {
			staleKeys.push(key);
		}
	}

	if (staleKeys.length > 0) {
		const liveValues = await coalescedCompute({
			scope,
			staleKeys,
			computeBatch: computeLive,
		});
		for (const [key, value] of liveValues) out.set(key, value);
		if (onStale) {
			try {
				onStale(staleKeys);
			} catch {
				// fire-and-forget; never let refresh failures break the read
			}
		}
	}

	return out;
}

// ---------------------------------------------------------------------------
// Per-process compute coalescer
// ---------------------------------------------------------------------------
// When many concurrent requests find the same key stale, we only want one
// DB compute. The registry maps a (scope, key) cache key to an in-flight
// Promise. New callers wanting any of those keys await the existing Promise
// instead of running their own batch. Keys not yet in-flight are batched
// into one DB call and registered.
//
// Race-safety: `inFlight.set` happens synchronously between scheduling the
// compute and the first `await`, so a concurrent caller arriving later sees
// the in-flight entry.
//
// Memory-safety: each registered key is always removed in a `finally`, so
// the registry size is bounded by concurrent in-flight stale keys.

type AnyMap = Map<unknown, unknown>;
const inFlight = new Map<string, Promise<AnyMap>>();

function cacheKey(scope: string, k: unknown): string {
	return `${scope}::${typeof k === "string" ? k : JSON.stringify(k)}`;
}

async function coalescedCompute<TKey, TValue>(params: {
	scope: string;
	staleKeys: TKey[];
	computeBatch: (keys: TKey[]) => Promise<Map<TKey, TValue>>;
}): Promise<Map<TKey, TValue>> {
	const { scope, staleKeys, computeBatch } = params;
	const result = new Map<TKey, TValue>();
	if (staleKeys.length === 0) return result;

	const ownedKeys: TKey[] = [];
	const awaitingKeys: TKey[] = [];
	for (const key of staleKeys) {
		if (inFlight.has(cacheKey(scope, key))) {
			awaitingKeys.push(key);
		} else {
			ownedKeys.push(key);
		}
	}

	// 1) Start our own batch for keys not already in-flight. Register the
	//    promise BEFORE the first await so concurrent callers see it.
	if (ownedKeys.length > 0) {
		const ownedCacheKeys = ownedKeys.map((k) => cacheKey(scope, k));
		const promise = computeBatch(ownedKeys);
		for (const ck of ownedCacheKeys) {
			inFlight.set(ck, promise as Promise<AnyMap>);
		}
		try {
			const computed = await promise;
			for (const [k, v] of computed) result.set(k, v);
		} finally {
			for (const ck of ownedCacheKeys) inFlight.delete(ck);
		}
	}

	// 2) Wait on any batches owned by other concurrent callers. Each unique
	//    promise is awaited only once.
	if (awaitingKeys.length > 0) {
		const promises = new Set<Promise<AnyMap>>();
		for (const key of awaitingKeys) {
			const p = inFlight.get(cacheKey(scope, key));
			if (p) promises.add(p);
		}
		const resolved = await Promise.all([...promises]);
		for (const map of resolved) {
			for (const key of awaitingKeys) {
				const v = map.get(key) as TValue | undefined;
				if (v !== undefined) result.set(key, v);
			}
		}
	}

	return result;
}
