import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface PageSubheadingProps {
	title: string;
	subtitle?: string | ReactNode;
	rightContent?: ReactNode;
	className?: string;
}

export function PageSubheading({
	title,
	subtitle,
	rightContent,
	className,
}: PageSubheadingProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between",
				className,
			)}
		>
			<div className="flex flex-col gap-1">
				<h2 className="text-xl font-bold">{title}</h2>
				{subtitle && (
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				)}
			</div>
			{rightContent && (
				<div className="flex items-center gap-4 text-sm font-medium">
					{rightContent}
				</div>
			)}
		</div>
	);
}
