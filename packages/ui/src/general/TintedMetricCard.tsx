import { Card, CardContent } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";

export type TintedMetricCardTone = "emerald" | "sky" | "violet" | "amber";

export const TINTED_METRIC_TONE_STYLES: Record<
	TintedMetricCardTone,
	{ card: string; title: string; value: string; iconWrap: string }
> = {
	emerald: {
		card: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/30",
		title: "text-emerald-800 dark:text-emerald-200",
		value: "text-emerald-950 dark:text-emerald-50",
		iconWrap:
			"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200",
	},
	sky: {
		card: "border-sky-200 bg-sky-50/50 dark:border-sky-900/40 dark:bg-sky-950/30",
		title: "text-sky-800 dark:text-sky-200",
		value: "text-sky-950 dark:text-sky-50",
		iconWrap: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200",
	},
	violet: {
		card: "border-violet-200 bg-violet-50/50 dark:border-violet-900/40 dark:bg-violet-950/30",
		title: "text-violet-800 dark:text-violet-200",
		value: "text-violet-950 dark:text-violet-50",
		iconWrap:
			"bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200",
	},
	amber: {
		card: "border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/30",
		title: "text-amber-800 dark:text-amber-200",
		value: "text-amber-950 dark:text-amber-50",
		iconWrap:
			"bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200",
	},
};

export type TintedMetricCardProps = {
	tone: TintedMetricCardTone;
	title: string;
	value: ReactNode;
	titleTrailing?: ReactNode;
	footer?: ReactNode;
	className?: string;
};

export function TintedMetricCard({
	tone,
	title,
	value,
	titleTrailing,
	footer,
	className,
}: Readonly<TintedMetricCardProps>) {
	const styles = TINTED_METRIC_TONE_STYLES[tone];
	return (
		<Card
			className={cn("rounded-xl border py-0 shadow-sm", styles.card, className)}
		>
			<CardContent className="p-4">
				{titleTrailing ? (
					<div className="flex items-start justify-between gap-2">
						<p className={cn("text-xs font-medium", styles.title)}>{title}</p>
						{titleTrailing}
					</div>
				) : (
					<p className={cn("text-xs font-medium", styles.title)}>{title}</p>
				)}
				<p className={cn("mt-1 text-2xl font-bold tabular-nums", styles.value)}>
					{value}
				</p>
				{footer}
			</CardContent>
		</Card>
	);
}
