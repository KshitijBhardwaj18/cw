import { Card, CardContent } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import {
	PERFORMANCE_METRIC_TYPE_LABELS,
	PERFORMANCE_SUMMARY_STAT_CARDS,
} from "@/constants/command-center.performance.configs";
import type { PerformanceMetricType } from "@/types/command-center";

const METRIC_TYPES = Object.keys(
	PERFORMANCE_METRIC_TYPE_LABELS,
) as PerformanceMetricType[];

const METRIC_CARDS_PER_SECTION = 4;

export function PerformanceSummaryStatCardSkeleton() {
	return (
		<Card className="border py-1">
			<CardContent className="space-y-3 p-4">
				<div className="flex items-center gap-2">
					<Skeleton className="size-8 shrink-0 rounded-md" />
					<Skeleton className="h-4 w-[8.5rem]" />
				</div>
				<div className="flex items-end gap-1.5">
					<Skeleton className="h-10 w-20" />
					<Skeleton className="mb-0.5 h-3 w-9" />
				</div>
			</CardContent>
		</Card>
	);
}

export function PerformanceMetricCardSkeleton() {
	return (
		<Card className="border py-1">
			<CardContent className="space-y-3 p-4">
				<Skeleton className="min-h-10 w-full" />
				<div className="space-y-1.5">
					<div className="flex items-center justify-between gap-2">
						<Skeleton className="h-3 w-9" />
						<Skeleton className="h-3 w-14" />
					</div>
					<div className="flex items-center justify-between gap-2">
						<Skeleton className="h-3 w-12" />
						<Skeleton className="h-3 w-10" />
					</div>
				</div>
				<Skeleton className="h-7 w-full rounded-sm" />
			</CardContent>
		</Card>
	);
}

export function PerformanceMetricsCardsSkeleton() {
	return (
		<>
			<div className="space-y-3">
				<p className="text-lg font-semibold">Workforce Summary</p>
				<p className="text-muted-foreground text-sm">
					Key workforce metrics and performance
				</p>
				<div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
					{PERFORMANCE_SUMMARY_STAT_CARDS.map((card) => (
						<PerformanceSummaryStatCardSkeleton key={card.key} />
					))}
				</div>
			</div>

			{METRIC_TYPES.map((type) => (
				<div key={type} className="space-y-3">
					<div className="flex items-center gap-3">
						<p className="text-lg font-semibold">
							{PERFORMANCE_METRIC_TYPE_LABELS[type]}
						</p>
						<div className="bg-primary/60 h-px flex-1" />
					</div>
					<div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
						{Array.from({ length: METRIC_CARDS_PER_SECTION }, (_, index) => (
							<PerformanceMetricCardSkeleton key={`${type}-${String(index)}`} />
						))}
					</div>
				</div>
			))}
		</>
	);
}
