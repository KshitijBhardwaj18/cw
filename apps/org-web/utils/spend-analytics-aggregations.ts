import type { SpendAnalyticsRow } from "@/services/billing.service";

const MS_PER_DAY = 86_400_000;

/** Allocate row spend across calendar days, then sum into each of the 3 months of `quarterStart`'s quarter. */
export function spendByMonthIndexInQuarter(
	quarterStart: Date,
	rows: SpendAnalyticsRow[],
): [number, number, number] {
	const y = quarterStart.getFullYear();
	const m = quarterStart.getMonth();
	const qStart = new Date(y, m - (m % 3), 1);
	const ranges: { start: Date; end: Date }[] = [
		{
			start: qStart,
			end: new Date(
				qStart.getFullYear(),
				qStart.getMonth() + 1,
				0,
				23,
				59,
				59,
				999,
			),
		},
		{
			start: new Date(qStart.getFullYear(), qStart.getMonth() + 1, 1),
			end: new Date(
				qStart.getFullYear(),
				qStart.getMonth() + 2,
				0,
				23,
				59,
				59,
				999,
			),
		},
		{
			start: new Date(qStart.getFullYear(), qStart.getMonth() + 2, 1),
			end: new Date(
				qStart.getFullYear(),
				qStart.getMonth() + 3,
				0,
				23,
				59,
				59,
				999,
			),
		},
	];

	const totals: [number, number, number] = [0, 0, 0];

	for (const r of rows) {
		const ps = new Date(r.periodStart);
		const pe = new Date(r.periodEnd);
		const amount = r.totalSpend;
		const days = Math.max(
			1,
			Math.round((pe.getTime() - ps.getTime()) / MS_PER_DAY) + 1,
		);
		const perDay = amount / days;

		for (let i = 0; i < 3; i++) {
			const { start, end } = ranges[i];
			const overlapStart = new Date(Math.max(ps.getTime(), start.getTime()));
			const overlapEnd = new Date(Math.min(pe.getTime(), end.getTime()));
			if (overlapStart <= overlapEnd) {
				const overlapDays =
					Math.round(
						(overlapEnd.getTime() - overlapStart.getTime()) / MS_PER_DAY,
					) + 1;
				totals[i] += perDay * overlapDays;
			}
		}
	}

	return totals;
}

/** Short month labels for the three months of the quarter containing `quarterStart`. */
export function monthLabelsForQuarterContaining(quarterStart: Date): string[] {
	const y = quarterStart.getFullYear();
	const m = quarterStart.getMonth();
	const q0 = m - (m % 3);
	const fmt = new Intl.DateTimeFormat("en-US", { month: "short" });
	return [
		fmt.format(new Date(y, q0, 1)),
		fmt.format(new Date(y, q0 + 1, 1)),
		fmt.format(new Date(y, q0 + 2, 1)),
	];
}

export type DepartmentSpendRow = {
	id: string;
	departmentLabel: string;
	totalSpend: number;
	totalHours: number;
	pctOfTotal: number;
};

export function groupSpendByDepartment(
	rows: SpendAnalyticsRow[],
): DepartmentSpendRow[] {
	const map = new Map<string, { totalSpend: number; totalHours: number }>();

	for (const r of rows) {
		const label = r.department?.name?.trim() || "Unassigned";
		const cur = map.get(label) ?? { totalSpend: 0, totalHours: 0 };
		cur.totalSpend += r.totalSpend;
		cur.totalHours += r.totalHours;
		map.set(label, cur);
	}

	const totalSpendAll = [...map.values()].reduce((s, v) => s + v.totalSpend, 0);

	return [...map.entries()]
		.map(([departmentLabel, v]) => ({
			id: departmentLabel,
			departmentLabel,
			totalSpend: v.totalSpend,
			totalHours: v.totalHours,
			pctOfTotal: totalSpendAll > 0 ? (v.totalSpend / totalSpendAll) * 100 : 0,
		}))
		.sort((a, b) => b.totalSpend - a.totalSpend);
}

/** Client-side filter matching org filter keys to department name substrings. */
export function filterSpendRowsByDepartmentKey(
	rows: SpendAnalyticsRow[],
	departmentKey: string,
): SpendAnalyticsRow[] {
	if (!departmentKey || departmentKey === "all") return rows;
	const needles: Record<string, string> = {
		icu: "icu",
		emergency: "emergency",
		rehabilitation: "rehab",
	};
	const needle = needles[departmentKey] ?? departmentKey;
	return rows.filter((r) =>
		(r.department?.name ?? "").toLowerCase().includes(needle),
	);
}
