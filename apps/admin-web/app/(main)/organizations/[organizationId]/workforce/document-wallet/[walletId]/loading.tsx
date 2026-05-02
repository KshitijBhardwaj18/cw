import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-6 w-48" />
			<div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
				<Skeleton className="h-48" />
				<Skeleton className="h-64" />
			</div>
		</div>
	);
}
