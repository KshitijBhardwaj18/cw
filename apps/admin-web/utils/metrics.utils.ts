import type { Metric } from "@repo/db";
import type { MetricType } from "@repo/shared";

export function groupMetricsByType(
	metrics: Metric[],
): Map<MetricType, Metric[]> {
	const map = new Map<MetricType, Metric[]>();
	for (const m of metrics) {
		const type = m.type as MetricType;
		const list = map.get(type) ?? [];
		list.push(m);
		map.set(type, list);
	}
	return map;
}
