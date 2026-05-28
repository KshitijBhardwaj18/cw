"use client";

import { Action } from "@repo/casl";
import type { MetricKey, MetricType } from "@repo/shared";
import { formatMetricValue, getLabel, metricGoalSuffix } from "@repo/shared";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/empty";
import { ConfigPageHeader } from "@repo/ui/general/ConfigPageHeader";
import { useDebouncedSearch } from "@repo/ui/hooks/use-debounced-search";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { METRIC_TYPE_OPTIONS } from "@/constants/metrics";
import type { OrgMetricKpi } from "@/constants/metrics-reporting";
import { useAuth } from "@/contexts";
import {
	useOrganizationMetrics,
	useUpdateOrganizationMetric,
	useUpsertOrganizationMetric,
} from "@/queries/metrics.query";
import { EditGoalDialog } from "./EditGoalDialog";
import { RecruitmentEfficiencyKpiCard } from "./RecruitmentEfficiencyKpiCard";

export const METRICS_REPORTING_PARAMS = {
	SEARCH: "mrSearch",
} as const;

function formatGoalDisplay(suffix: string, raw: string): string {
	if (!raw) return raw;
	if (suffix === "%") return `${raw}%`;
	if (suffix === "days") return `${raw} days`;
	return raw;
}

function toUiKpi(input: {
	metricId: string;
	metricKey: MetricKey;
	name: string;
	metricType: MetricType;
	goal: number | null;
	currentValue: number | null;
	isActive: boolean;
	hasOrganizationMetric: boolean;
}): UiKpi {
	const suffix = metricGoalSuffix(input.metricKey);
	const goalRaw =
		input.goal == null || Number.isNaN(input.goal) ? "" : String(input.goal);
	const currentDisplay =
		input.currentValue == null || Number.isNaN(input.currentValue)
			? "N/A"
			: formatMetricValue(input.metricKey, input.currentValue);
	return {
		id: input.metricId,
		name: input.name,
		goalDisplay: goalRaw ? formatGoalDisplay(suffix, goalRaw) : "Not set",
		currentDisplay,
		trend: "flat",
		enabled: input.isActive,
		goalEditValue: goalRaw,
		goalInputSuffix: suffix,
		goalHelperText: "Set target for this organization metric",
		metricType: input.metricType,
		hasOrganizationMetric: input.hasOrganizationMetric,
	};
}

type UiKpi = OrgMetricKpi & {
	metricType: MetricType;
	hasOrganizationMetric: boolean;
};

export function MetricsReportingKpisTabContent({
	organizationId,
}: Readonly<{
	organizationId: string;
}>) {
	const { ability } = useAuth();
	const canUpdate = ability.can(Action.Update, "Metric");
	const { data, isLoading } = useOrganizationMetrics(organizationId);
	const upsertOrganizationMetric = useUpsertOrganizationMetric(organizationId);
	const updateOrganizationMetric = useUpdateOrganizationMetric(organizationId);

	const { localSearch, searchFromUrl, handleSearchChange } = useDebouncedSearch(
		{
			paramKey: METRICS_REPORTING_PARAMS.SEARCH,
		},
	);

	const [goalDialogOpen, setGoalDialogOpen] = useState(false);
	const [editingKpi, setEditingKpi] = useState<UiKpi | null>(null);

	const kpisByType = useMemo(() => {
		const seed = Object.fromEntries(
			METRIC_TYPE_OPTIONS.map((o) => [o.value, [] as UiKpi[]]),
		) as Record<MetricType, UiKpi[]>;
		if (!data) return seed;
		for (const row of data) {
			const ui = toUiKpi({
				metricId: row.metric.id,
				metricKey: row.metric.key as MetricKey,
				name: row.metric.name,
				metricType: row.metric.type as MetricType,
				goal: row.organizationMetric?.goal ?? null,
				currentValue: row.latestSnapshot?.value ?? null,
				isActive: row.organizationMetric?.isActive ?? false,
				hasOrganizationMetric: row.organizationMetric != null,
			});
			seed[row.metric.type as MetricType].push(ui);
		}
		for (const t of METRIC_TYPE_OPTIONS.map((o) => o.value)) {
			seed[t].sort((a, b) => a.name.localeCompare(b.name));
		}
		return seed;
	}, [data]);

	const filteredAndGrouped = useMemo(() => {
		const q = searchFromUrl.trim().toLowerCase();
		const map = new Map<MetricType, UiKpi[]>();
		for (const t of METRIC_TYPE_OPTIONS.map((o) => o.value)) {
			const list = kpisByType[t].filter(
				(k) =>
					!q ||
					k.name.toLowerCase().includes(q) ||
					k.goalDisplay.toLowerCase().includes(q) ||
					k.currentDisplay.toLowerCase().includes(q),
			);
			if (list.length > 0) map.set(t, list);
		}
		return map;
	}, [kpisByType, searchFromUrl]);

	const orderedTypes = METRIC_TYPE_OPTIONS.map((o) => o.value).filter((t) =>
		filteredAndGrouped.has(t),
	);

	const lastRefreshedAt = useMemo(() => {
		if (!data) return null;
		let latest: Date | null = null;
		for (const row of data) {
			const computedAt = row.latestSnapshot?.computedAt
				? new Date(row.latestSnapshot.computedAt)
				: null;
			if (!computedAt) continue;
			if (!latest || computedAt > latest) latest = computedAt;
		}
		return latest;
	}, [data]);

	const lastRefreshedLabel = lastRefreshedAt
		? `Refreshes every 24 hours · Last refreshed ${formatDistanceToNow(lastRefreshedAt, { addSuffix: true })}`
		: "Refreshes every 24 hours · Awaiting first refresh";

	const kpiById = useMemo(() => {
		const map = new Map<string, UiKpi>();
		for (const type of METRIC_TYPE_OPTIONS.map((o) => o.value)) {
			for (const kpi of kpisByType[type]) {
				map.set(kpi.id, kpi);
			}
		}
		return map;
	}, [kpisByType]);

	const handleStatusChange = (id: string, enabled: boolean) => {
		const metric = kpiById.get(id);
		if (!metric) return;
		if (metric.hasOrganizationMetric) {
			updateOrganizationMetric.mutate(
				{
					metricId: id,
					payload: { isActive: enabled },
				},
				{
					onSuccess: () => {
						toast.success("Metric status updated");
					},
					onError: (error) => {
						toast.error(
							error instanceof Error ? error.message : "Failed to update",
						);
					},
				},
			);
			return;
		}
		if (!enabled) {
			return;
		}
		const rawGoal = metric.goalEditValue.trim();
		if (!rawGoal) {
			setEditingKpi(metric);
			setGoalDialogOpen(true);
			toast.error("Set a goal before enabling this metric");
			return;
		}
		const parsedGoal = Number.parseFloat(rawGoal);
		if (!Number.isFinite(parsedGoal)) {
			toast.error("Goal must be a valid number before enabling");
			return;
		}
		upsertOrganizationMetric.mutate(
			{
				metricId: id,
				goal: parsedGoal,
				isActive: enabled,
			},
			{
				onSuccess: () => {
					toast.success("Metric status updated");
				},
				onError: (error) => {
					toast.error(
						error instanceof Error ? error.message : "Failed to update",
					);
				},
			},
		);
	};

	const handleEditGoalSave = (
		kpiId: string,
		nextGoalEditValue: string,
	): Promise<boolean> => {
		const metric = kpiById.get(kpiId);
		if (!metric) return Promise.resolve(false);
		const nextGoal = Number.parseFloat(nextGoalEditValue);
		if (!Number.isFinite(nextGoal)) {
			toast.error("Goal must be a valid number");
			return Promise.resolve(false);
		}
		return new Promise<boolean>((resolve) => {
			try {
				if (metric.hasOrganizationMetric) {
					updateOrganizationMetric.mutate(
						{
							metricId: kpiId,
							payload: { goal: nextGoal },
						},
						{
							onSuccess: () => {
								toast.success("Goal updated");
								resolve(true);
							},
							onError: (error) => {
								toast.error(
									error instanceof Error ? error.message : "Failed to update",
								);
								resolve(false);
							},
						},
					);
					return;
				}
				upsertOrganizationMetric.mutate(
					{
						metricId: kpiId,
						goal: nextGoal,
						isActive: metric.enabled,
					},
					{
						onSuccess: () => {
							toast.success("Goal updated");
							resolve(true);
						},
						onError: (error) => {
							toast.error(
								error instanceof Error ? error.message : "Failed to update",
							);
							resolve(false);
						},
					},
				);
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to update",
				);
				resolve(false);
			}
		});
	};

	return (
		<div className="space-y-6">
			<ConfigPageHeader
				title="Performance Dashboard"
				description="Review goals and current performance at a glance. Toggle metrics on or off and adjust targets as needed."
				total={data?.length ?? 0}
				itemLabel=""
				itemLabelPlural=""
				search={{
					value: localSearch,
					onChange: handleSearchChange,
					placeholder: "Search metrics...",
				}}
			/>
			<p className="text-muted-foreground text-xs">{lastRefreshedLabel}</p>

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
								<h4 className="border-primary mb-4 border-b pb-2 text-lg font-semibold">
									{typeLabel}
								</h4>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
									{typeMetrics.map((metric) => (
										<RecruitmentEfficiencyKpiCard
											key={metric.id}
											kpi={metric}
											canUpdate={canUpdate}
											onStatusChange={handleStatusChange}
											onEditGoal={() => {
												setEditingKpi(metric);
												setGoalDialogOpen(true);
											}}
										/>
									))}
								</div>
							</section>
						);
					})}
				</div>
			)}
			{isLoading && (
				<p className="text-muted-foreground text-sm">Loading metrics...</p>
			)}

			<EditGoalDialog
				open={goalDialogOpen}
				onOpenChange={(open) => {
					setGoalDialogOpen(open);
					if (!open) setEditingKpi(null);
				}}
				kpi={editingKpi}
				onSave={handleEditGoalSave}
			/>
		</div>
	);
}
