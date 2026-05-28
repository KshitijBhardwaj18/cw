import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type { OperationsFilterStatCardItem } from "@/types/command-center";

type OperationsFilterStatCardProps = {
	card: OperationsFilterStatCardItem;
	count: number;
	isActive: boolean;
	onClick: () => void;
};

export const OperationsFilterStatCard = ({
	card,
	count,
	isActive,
	onClick,
}: Readonly<OperationsFilterStatCardProps>) => {
	const Icon = card.icon;

	return (
		<button type="button" className="text-left" onClick={onClick}>
			<Card
				className={cn(
					"border py-1 transition-all hover:shadow-sm",
					isActive ? card.activeClassName : "hover:border-border/80",
				)}
			>
				<CardContent className="space-y-3 p-4">
					<div className="flex items-start justify-between gap-3">
						<div className="flex items-center gap-2">
							<div className="bg-muted flex size-8 items-center justify-center rounded-md">
								<Icon className={cn("size-4", card.iconClassName)} />
							</div>
							<div className="space-y-1">
								<p className="text-sm font-semibold">{card.label}</p>
								<p className="text-muted-foreground text-xs">
									{card.description}
								</p>
							</div>
						</div>
						<div className="text-right">
							<p
								className={cn(
									"text-4xl leading-none font-semibold",
									card.countClassName,
								)}
							>
								{count}
							</p>
							<p className="text-muted-foreground mt-1 text-xs">
								{card.countLabel}
							</p>
						</div>
					</div>
					<Badge
						variant="secondary"
						className={cn("rounded-sm", card.priorityClassName)}
					>
						{card.priorityLabel}
					</Badge>
				</CardContent>
			</Card>
		</button>
	);
};
