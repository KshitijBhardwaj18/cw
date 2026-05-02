import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/card";
import { AlertCircle } from "lucide-react";

type TotalWeightCardProps = {
	totalWeight: number;
};

const TotalWeightCard = ({ totalWeight }: TotalWeightCardProps) => {
	const isOverLimit = totalWeight > 100;
	const unassigned = 100 - totalWeight;

	return (
		<Card className="gap-0">
			<CardHeader>
				<CardTitle className="text-base font-semibold">Total Weight</CardTitle>
				<CardDescription className="text-sm text-muted-foreground">
					Combined weight of all enabled criteria (must not exceed 100%)
				</CardDescription>
				<CardAction>
					<p
						className={`text-3xl font-black sm:text-4xl ${
							isOverLimit
								? "text-destructive"
								: unassigned > 0
									? "text-yellow-600 dark:text-yellow-500"
									: "text-primary"
						}`}
					>
						{totalWeight}%
					</p>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-0 py-0">
				{isOverLimit && (
					<span className="flex items-center gap-1.5 text-sm text-destructive">
						<AlertCircle className="size-4 shrink-0" />
						Total weight exceeds 100%. Please adjust criterion weights.
					</span>
				)}
				{!isOverLimit && unassigned > 0 && (
					<span className="flex items-center gap-1.5 text-sm text-yellow-700 dark:text-yellow-600">
						<AlertCircle className="size-4 shrink-0" />
						Unassigned weight: {unassigned}%. Consider enabling additional
						criteria or adjusting weights to reach 100%.
					</span>
				)}
			</CardContent>
		</Card>
	);
};

export default TotalWeightCard;
