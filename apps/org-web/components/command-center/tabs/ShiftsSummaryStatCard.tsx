import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type {
	CommandCenterShiftSummaryCardConfig,
	CommandCenterShiftSummaryKey,
} from "@/types/command-center";

type ShiftsSummaryStatCardProps = {
	card: CommandCenterShiftSummaryCardConfig;
	counts: Record<CommandCenterShiftSummaryKey, number>;
};

export const ShiftsSummaryStatCard = ({
	card,
	counts,
}: Readonly<ShiftsSummaryStatCardProps>) => {
	const helperText =
		card.key === "filled"
			? `${
					counts["total-shifts"] > 0
						? Math.round((counts.filled / counts["total-shifts"]) * 100)
						: 0
				}% coverage`
			: card.helperLabel;

	return (
		<Card className={cn("border py-1", card.cardClassName)}>
			<CardContent className="space-y-2 p-4">
				<p className="text-sm font-semibold">{card.label}</p>
				<p
					className={cn(
						"text-4xl leading-none font-semibold",
						card.countClassName,
					)}
				>
					{counts[card.key]}
				</p>
				<p className={cn("text-xs", card.helperClassName)}>{helperText}</p>
			</CardContent>
		</Card>
	);
};
