import { Skeleton } from "@repo/ui/components/skeleton";

function PlacementCardSkeleton() {
	return (
		<div className="flex flex-col gap-3 rounded-xl border p-4">
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0 flex-1 space-y-2">
					<Skeleton className="h-5 w-3/4" />
					<Skeleton className="h-3 w-1/2" />
				</div>
				<Skeleton className="h-8 w-8 shrink-0 rounded-md" />
			</div>
			<div className="space-y-2 border-t pt-3">
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-3 w-2/3" />
				<Skeleton className="h-3 w-1/2" />
			</div>
		</div>
	);
}

export function PlacementsPageLoading() {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_, i) => (
				<PlacementCardSkeleton key={i} />
			))}
		</div>
	);
}
