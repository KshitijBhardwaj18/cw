export function groupByKey<T, K extends string>(
	items: T[],
	getKey: (item: T) => K,
): [K, T[]][] {
	const groups = new Map<K, T[]>();
	for (const item of items) {
		const key = getKey(item);
		const existing = groups.get(key);
		if (existing) {
			existing.push(item);
		} else {
			groups.set(key, [item]);
		}
	}
	return Array.from(groups.entries()).sort(([a], [b]) =>
		String(a).localeCompare(String(b)),
	);
}
