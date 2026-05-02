import type { Metric, MetricType } from "@repo/db";

export function groupMetricsByType(
	metrics: Metric[],
): Map<MetricType, Metric[]> {
	const map = new Map<MetricType, Metric[]>();
	for (const m of metrics) {
		const list = map.get(m.type) ?? [];
		list.push(m);
		map.set(m.type, list);
	}
	return map;
}
