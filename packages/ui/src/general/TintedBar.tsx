import { cn } from "@repo/ui/lib/utils";
import type React from "react";
import type { ReactNode } from "react";

export type TintedBarTone = "emerald" | "amber" | "red" | "sky" | "violet";

const TINTED_BAR_TONE_STYLES: Record<
	TintedBarTone,
	{ bar: string; iconStatus: string }
> = {
	emerald: {
		bar: "bg-emerald-50/60 border-emerald-200",
		iconStatus: "text-emerald-700",
	},
	amber: {
		bar: "bg-amber-50/60 border-amber-200",
		iconStatus: "text-amber-700",
	},
	red: {
		bar: "bg-red-50/60 border-red-200",
		iconStatus: "text-red-700",
	},
	sky: {
		bar: "bg-sky-50/60 border-sky-200",
		iconStatus: "text-sky-700",
	},
	violet: {
		bar: "bg-violet-50/60 border-violet-200",
		iconStatus: "text-violet-700",
	},
};

export interface TintedBarProps {
	tone: TintedBarTone;
	label: ReactNode;
	statusLabel?: ReactNode;
	icon?: React.ComponentType<{ className?: string }>;
	className?: string;
}

export function TintedBar({
	tone,
	label,
	statusLabel,
	icon: Icon,
	className,
}: TintedBarProps) {
	const styles = TINTED_BAR_TONE_STYLES[tone];
	return (
		<div
			className={cn(
				"flex items-center justify-between rounded border py-2 px-3 transition-colors text-sm",
				styles.bar,
				className,
			)}
		>
			<div className="text-foreground">{label}</div>
			{(Icon || statusLabel) && (
				<div
					className={cn("flex items-center gap-2 text-sm", styles.iconStatus)}
				>
					{Icon && <Icon className="size-4" />}
					{statusLabel}
				</div>
			)}
		</div>
	);
}
