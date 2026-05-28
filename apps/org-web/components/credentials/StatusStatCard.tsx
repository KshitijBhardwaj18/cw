import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type { StatusStatCardItem } from "@/types/credentials";

interface StatusStatCardProps<T extends string = string> {
	card: StatusStatCardItem<T>;
	count: number;
	isActive?: boolean;
	onClick?: () => void;
}

export const StatusStatCard = <T extends string = string>({
	card,
	count,
	isActive = false,
	onClick,
}: Readonly<StatusStatCardProps<T>>) => {
	const Icon = card.icon;

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={!onClick}
			className={cn("text-left", !onClick && "cursor-default")}
		>
			<Card
				className={cn(
					"py-1 transition-all",
					onClick ? "cursor-pointer hover:shadow-sm" : "cursor-default",
					isActive ? card.activeClassName : "hover:border-border/80",
				)}
			>
				<CardContent className="p-4">
					<div className="flex items-start justify-between gap-2">
						<div>
							<p className="text-muted-foreground text-sm font-medium">
								{card.label}
							</p>
							<p
								className={cn(
									"mt-1 text-3xl font-semibold",
									card.countClassName,
								)}
							>
								{count}
							</p>
							<p className="text-muted-foreground mt-1 text-xs">
								{card.subLabel}
							</p>
						</div>
						<Icon className={cn("mt-0.5 size-5", card.iconClassName)} />
					</div>
				</CardContent>
			</Card>
		</button>
	);
};
