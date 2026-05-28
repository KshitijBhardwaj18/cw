import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type {
	HiringFunnelSummaryCardConfig,
	HiringFunnelSummaryKey,
} from "@/types/command-center";

type HiringFunnelSummaryCardProps = {
	card: HiringFunnelSummaryCardConfig;
	summaryByKey: Record<
		HiringFunnelSummaryKey,
		{
			value: number;
			helperText: string;
		}
	>;
};

export const HiringFunnelSummaryCard = ({
	card,
	summaryByKey,
}: Readonly<HiringFunnelSummaryCardProps>) => {
	const Icon = card.icon;
	const summary = summaryByKey[card.key];

	return (
		<Card className="border py-1">
			<CardContent className="space-y-3 p-4">
				<div className="flex items-center justify-between gap-3">
					<p className="text-sm font-semibold">{card.label}</p>
					<Icon className={cn("size-5", card.iconClassName)} />
				</div>
				<p className="text-4xl leading-none font-semibold">{summary.value}</p>
				<p className="text-muted-foreground text-xs">{summary.helperText}</p>
			</CardContent>
		</Card>
	);
};
