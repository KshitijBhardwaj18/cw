import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "../components/button";
import { cn } from "../lib/utils";

interface ActionBarProps<T extends "link" | "button" = "button"> {
	children: ReactNode;
	type?: T;
	variant?: "default" | "danger" | "success";
	href?: T extends "link" ? string : never;
	onClick?: T extends "button" ? () => void : never;
	className?: string;
	innerClassName?: string;
	showChevron?: boolean;
}

export function ActionBar<T extends "link" | "button">({
	children,
	type = "button" as T,
	variant = "default",
	href,
	onClick,
	className,
	innerClassName,
	showChevron = true,
}: Readonly<ActionBarProps<T>>) {
	const isLink = !!(type === "link" && href);

	return (
		<Button
			variant="outline"
			className={cn(
				"group flex h-auto w-full items-center justify-between font-normal transition-all p-2",
				variant === "danger" &&
					"border-red-100 bg-red-50/20 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200",
				variant === "success" &&
					"hover:border-emerald-200 hover:bg-emerald-50/20",
				className,
			)}
			onClick={!isLink ? onClick : undefined}
			asChild={isLink}
		>
			{isLink ? (
				<Link href={href}>
					<div className={cn("flex items-center", innerClassName)}>
						{children}
					</div>
					{showChevron && <ChevronIcon variant={variant} />}
				</Link>
			) : (
				<>
					<div className={cn("flex items-center", innerClassName)}>
						{children}
					</div>
					{showChevron && <ChevronIcon variant={variant} />}
				</>
			)}
		</Button>
	);
}

function ChevronIcon({
	variant,
}: Readonly<{
	variant: "default" | "danger" | "success";
}>) {
	return (
		<ChevronRight
			className={cn(
				"size-4 shrink-0 transition-transform group-hover:translate-x-1",
				variant === "danger" ? "text-red-400" : "text-muted-foreground",
			)}
		/>
	);
}
