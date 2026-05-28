import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import { UsersRound } from "lucide-react";
import type { ActiveWorkforceTypeCardItem } from "@/types/command-center";

type ActiveWorkforceStatCardProps = {
	card: ActiveWorkforceTypeCardItem;
	count: number;
};

const cardToneStyles = {
	internal: {
		iconWrapper: "bg-blue-100 text-blue-600",
	},
	external: {
		iconWrapper: "bg-violet-100 text-violet-600",
	},
} as const;

export const ActiveWorkforceStatCard = ({
	card,
	count,
}: Readonly<ActiveWorkforceStatCardProps>) => {
	return (
		<Card className="rounded-none border py-1">
			<CardContent className="space-y-3 p-4">
				<div className="flex items-center gap-3">
					<div
						className={cn(
							"flex size-10 items-center justify-center rounded-none",
							cardToneStyles[card.tone].iconWrapper,
						)}
					>
						<UsersRound className="size-5" />
					</div>
					<p className="text-sm font-semibold">{card.label}</p>
				</div>
				<div className="flex flex-row items-baseline gap-2">
					<p className="text-4xl leading-none font-semibold">{count}</p>
					<p className="text-muted-foreground text-xs">active workers</p>
				</div>
			</CardContent>
		</Card>
	);
};
