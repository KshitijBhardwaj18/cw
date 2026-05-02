import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

export function CandidatePortalContentSkeleton({
	className,
	variant = "default",
}: {
	className?: string;
	/** default: back link + main block; compact: title + block */
	variant?: "default" | "compact";
}) {
	return (
		<div className={cn("space-y-6", className)}>
			{variant === "default" ? (
				<Skeleton className="h-9 w-48" />
			) : (
				<Skeleton className="h-9 w-64" />
			)}
			<Skeleton className="h-64 w-full rounded-lg" />
		</div>
	);
}
