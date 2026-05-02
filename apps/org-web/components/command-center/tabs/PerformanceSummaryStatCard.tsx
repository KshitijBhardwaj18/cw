import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type {
	PerformanceSummaryStatCardConfig,
	PerformanceSummaryStatKey,
} from "@/types/command-center";

type PerformanceSummaryStatCardProps = {
	card: PerformanceSummaryStatCardConfig;
	valueByKey: Record<PerformanceSummaryStatKey, string>;
};

export const PerformanceSummaryStatCard = ({
	card,
	valueByKey,
}: PerformanceSummaryStatCardProps) => {
	const Icon = card.icon;

	return (
		<Card className="border py-1">
			<CardContent className="space-y-3 p-4">
				<div className="flex items-center gap-2">
					<div
						className={cn(
							"flex size-8 items-center justify-center rounded-md",
							card.toneClassName,
						)}
					>
						<Icon className="size-4" />
					</div>
					<p className="text-sm font-semibold">{card.label}</p>
				</div>
				<div className="flex items-end gap-1.5">
					<p className="text-4xl leading-none font-semibold">
						{valueByKey[card.key]}
					</p>
					{card.unitLabel ? (
						<p className="text-muted-foreground text-xs">{card.unitLabel}</p>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
};
