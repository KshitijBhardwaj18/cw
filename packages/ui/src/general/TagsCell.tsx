"use client";

import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";

interface TagsCellProps {
	tags: string[];
	className?: string;
}

export function TagsCell({ tags, className }: Readonly<TagsCellProps>) {
	if (tags.length === 0) {
		return <span className="text-muted-foreground text-sm">No tags</span>;
	}

	const visibleTags = tags.slice(0, 2);
	const hiddenCount = Math.max(tags.length - visibleTags.length, 0);

	return (
		<div className={cn("flex flex-wrap items-center gap-2", className)}>
			{visibleTags.map((tag) => (
				<Badge key={tag} variant="secondary" className="text-sm font-medium">
					{tag}
				</Badge>
			))}
			{hiddenCount > 0 && (
				<Badge variant="secondary" className="text-sm font-medium">
					+{hiddenCount}
				</Badge>
			)}
		</div>
	);
}
