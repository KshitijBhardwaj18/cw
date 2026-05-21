"use client";

import { Action } from "@repo/casl";
import { getLabel } from "@repo/shared";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { SearchBar } from "@repo/ui/general/SearchBar";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { useMemo } from "react";
import { toast } from "sonner";
import { METRIC_TYPE_OPTIONS } from "@/constants/metrics";
import { useAuth } from "@/contexts";
import { useMetrics, useUpdateMetricStatus } from "@/queries/metrics.query";
import { groupMetricsByType } from "@/utils/metrics.utils";
import { MetricCard } from "./MetricCard";

export function MetricsPageContent() {
	const { ability } = useAuth();
	const { data: metrics } = useMetrics();
	const updateStatus = useUpdateMetricStatus();
	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			paramKey: "search",
		},
	);

	const canUpdate = ability.can(Action.Update, "Metric");

	const filteredAndGrouped = useMemo(() => {
		const q = searchFromUrl.trim().toLowerCase();
		const filtered = q
			? metrics.filter(
					(m) =>
						m.name.toLowerCase().includes(q) ||
						m.formula.toLowerCase().includes(q),
				)
			: metrics;
		return groupMetricsByType(filtered);
	}, [metrics, searchFromUrl]);

	const orderedTypes = METRIC_TYPE_OPTIONS.map((o) => o.value).filter((t) =>
		filteredAndGrouped.has(t),
	);

	const handleStatusChange = (id: string, status: boolean) => {
		updateStatus.mutate(
			{ id, status },
			{
				onSuccess: () => {
					toast.success(status ? "Metric enabled" : "Metric disabled");
				},
				onError: (err) => {
					toast.error(err instanceof Error ? err.message : "Failed to update");
				},
			},
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold">Performance Dashboard</h1>
						<p className="text-muted-foreground text-sm">
							Configure metric formulas and control global metric visibility
							across the platform.
						</p>
					</div>
				</div>
				<SearchBar
					placeholder="Search metrics..."
					value={localSearch}
					onChange={handleSearchChange}
				/>
			</div>

			{orderedTypes.length === 0 ? (
				<Empty className="border">
					<EmptyHeader>
						<EmptyTitle>No metrics found</EmptyTitle>
						<EmptyDescription>
							{searchFromUrl.trim()
								? "Try a different search term."
								: "There are no metrics to display."}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div className="space-y-8">
					{orderedTypes.map((type) => {
						const typeMetrics = filteredAndGrouped.get(type) ?? [];
						const typeLabel = getLabel(METRIC_TYPE_OPTIONS, type);
						return (
							<section key={type}>
								<h3 className="mb-4 border-b pb-2 text-lg font-semibold">
									{typeLabel}
								</h3>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{typeMetrics.map((metric) => (
										<MetricCard
											key={metric.id}
											metric={metric}
											onStatusChange={handleStatusChange}
											canUpdate={canUpdate}
										/>
									))}
								</div>
							</section>
						);
					})}
				</div>
			)}
		</div>
	);
}
