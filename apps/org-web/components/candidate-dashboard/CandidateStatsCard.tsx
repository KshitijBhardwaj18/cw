import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

type StatVariant = "info" | "violet" | "success" | "warning" | "default";

interface CandidateStatsCardProps {
	label: string;
	value: string | number;
	icon: LucideIcon;
	isIncreased?: boolean;
	variant?: StatVariant;
	href: string;
	className?: string;
}

export function CandidateStatsCard({
	label,
	value,
	icon: Icon,
	isIncreased,
	variant = "default",
	href,
	className,
}: Readonly<CandidateStatsCardProps>) {
	const TrendIcon = isIncreased ? TrendingUp : TrendingDown;

	return (
		<Link href={href}>
			<Card className={cn("group relative py-4", className)}>
				<CardContent className="flex flex-col gap-4 px-4">
					<div className="flex justify-between items-start">
						<div
							className={cn(
								"h-10 w-10 rounded-lg flex items-center justify-center [&>svg]:size-5",
								variant === "info" && "bg-sky-100 text-sky-700",
								variant === "violet" && "bg-violet-100 text-violet-700",
								variant === "success" && "bg-green-100 text-green-700",
								variant === "warning" && "bg-amber-100 text-amber-800",
								variant === "default" && "bg-muted text-muted-foreground",
							)}
						>
							<Icon />
						</div>
						{isIncreased !== undefined && (
							<TrendIcon className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
						)}
					</div>
					<div className="flex flex-col gap-1">
						<span className="text-2xl font-semibold text-foreground">
							{value}
						</span>
						<span className="text-sm text-muted-foreground">{label}</span>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
