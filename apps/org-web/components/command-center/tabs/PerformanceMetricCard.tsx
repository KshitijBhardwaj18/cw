import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type { PerformanceMetricItem } from "@/types/command-center";

type PerformanceMetricCardProps = {
	metric: PerformanceMetricItem;
};

const statusStyles = {
	MEETING_GOAL: {
		currentClassName: "text-green-600",
		dotClassName: "bg-green-600",
		badgeClassName: "bg-green-50 text-green-700",
		label: "Meeting Goal",
	},
	BELOW_GOAL: {
		currentClassName: "text-red-600",
		dotClassName: "bg-red-600",
		badgeClassName: "bg-red-50 text-red-700",
		label: "Below Goal",
	},
} as const;

export const PerformanceMetricCard = ({
	metric,
}: PerformanceMetricCardProps) => {
	const status = statusStyles[metric.status];

	return (
		<Card className="border py-1">
			<CardContent className="space-y-3 p-4">
				<p className="line-clamp-2 min-h-10 text-sm font-semibold">
					{metric.title}
				</p>
				<div className="space-y-1.5">
					<div className="flex items-center justify-between gap-2 text-xs">
						<span className="text-muted-foreground">Goal:</span>
						<span>{metric.goal}</span>
					</div>
					<div className="flex items-center justify-between gap-2 text-xs">
						<span className="text-muted-foreground">Current:</span>
						<span className={cn("font-semibold", status.currentClassName)}>
							{metric.current}
						</span>
					</div>
				</div>
				<div
					className={cn(
						"inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium w-full",
						status.badgeClassName,
					)}
				>
					<span
						className={cn(
							"mr-1.5 inline-block size-1.5 rounded-full",
							status.dotClassName,
						)}
					/>
					<span>{status.label}</span>
				</div>
			</CardContent>
		</Card>
	);
};
