import { cn } from "@repo/ui/lib/utils";
import type React from "react";
import { Card } from "../components/card";

interface BannerProps {
	variant?: "info" | "warning" | "error";
	size?: "default" | "sm";
	icon: React.ReactNode;
	title?: string;
	description: React.ReactNode;
	footer?: string | React.ReactNode;
	action?: React.ReactNode;
	className?: string;
	flow?: "kv" | "col";
	tintedText?: boolean;
}

export const Banner = ({
	variant = "info",
	size = "default",
	icon,
	title,
	description,
	footer,
	action,
	className,
	flow = "kv",
	tintedText = false,
}: BannerProps) => (
	<Card
		className={cn(
			"flex flex-row",
			size === "default" ? "gap-4 p-6" : "gap-3 p-3 px-4",
			variant === "info" && "border-blue-500/10 bg-blue-500/5 text-blue-800",
			variant === "warning" &&
				"border-yellow-500/10 bg-yellow-500/5 text-yellow-800",
			variant === "error" &&
				"border-destructive/10 bg-destructive/5 text-destructive",
			className,
		)}
	>
		<div
			className={cn(
				"mt-0.5 shrink-0",
				variant === "info" && "text-blue-600",
				variant === "warning" && "text-yellow-600",
				variant === "error" && "text-destructive",
			)}
		>
			{icon}
		</div>
		<div
			className={cn("flex-1", size === "default" ? "space-y-1.5" : "space-y-0")}
		>
			{flow === "kv" ? (
				<h4
					className={cn(
						"text-sm font-semibold leading-tight",
						!tintedText && "text-foreground",
					)}
				>
					{title && `${title}: `}
					<span
						className={cn(
							"font-normal",
							!tintedText && "text-muted-foreground",
						)}
					>
						{description}
					</span>
				</h4>
			) : (
				<>
					{title && (
						<h4
							className={cn(
								"text-sm font-semibold leading-tight",
								!tintedText && "text-foreground",
							)}
						>
							{title}
						</h4>
					)}
					<div
						className={cn(
							"text-sm leading-relaxed",
							!tintedText && "text-muted-foreground",
						)}
					>
						{description}
					</div>
				</>
			)}
			{footer && (
				<div
					className={cn(
						"text-muted-foreground text-sm leading-relaxed",
						size === "default" && "mt-1.5",
					)}
				>
					{footer}
				</div>
			)}
		</div>
		{action && <div className="flex shrink-0 items-start">{action}</div>}
	</Card>
);
