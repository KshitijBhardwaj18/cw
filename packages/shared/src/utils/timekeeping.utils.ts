type SplitWeeklyOvertimeHoursInput<T> = {
	rows: T[];
	threshold: number;
	getHours: (row: T) => number;
	getGroupKey: (row: T) => string;
	getSortValue: (row: T) => number;
};

export function splitWeeklyOvertimeHours<T>({
	rows,
	threshold,
	getHours,
	getGroupKey,
	getSortValue,
}: SplitWeeklyOvertimeHoursInput<T>): Array<{
	regularHours: number;
	overtimeHours: number;
}> {
	const normalizedThreshold = Number.isFinite(threshold)
		? Math.max(0, threshold)
		: 0;
	const indexed = rows.map((row, idx) => ({ row, idx }));
	const byGroup = new Map<string, Array<(typeof indexed)[number]>>();
	for (const item of indexed) {
		const key = getGroupKey(item.row);
		const list = byGroup.get(key) ?? [];
		list.push(item);
		byGroup.set(key, list);
	}

	const result = Array.from({ length: rows.length }, () => ({
		regularHours: 0,
		overtimeHours: 0,
	}));

	byGroup.forEach((list) => {
		list.sort((a, b) => {
			const diff = getSortValue(a.row) - getSortValue(b.row);
			return diff !== 0 ? diff : a.idx - b.idx;
		});
		let cumulative = 0;
		for (const item of list) {
			const hours = Math.max(0, Number(getHours(item.row) || 0));
			const regularRemaining = Math.max(0, normalizedThreshold - cumulative);
			const regularHours = Math.min(hours, regularRemaining);
			const overtimeHours = Math.max(0, hours - regularHours);
			cumulative += hours;
			result[item.idx] = { regularHours, overtimeHours };
		}
	});

	return result;
}
