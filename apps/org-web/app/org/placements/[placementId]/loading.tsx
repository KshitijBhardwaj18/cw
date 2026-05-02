import { Skeleton } from "@repo/ui/components/skeleton";

export default function PlacementDetailLoading() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-6 w-48" />
			<div className="space-y-6">
				<div className="rounded-lg border p-6">
					<div className="flex flex-wrap items-start gap-3">
						<div className="space-y-2">
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-4 w-40" />
						</div>
						<Skeleton className="h-6 w-20 shrink-0 rounded-full" />
					</div>
					<div className="mt-6 grid gap-8 md:grid-cols-2">
						<div className="space-y-4">
							<Skeleton className="h-4 w-32" />
							<div className="space-y-2">
								{Array.from({ length: 6 }).map((_, i) => (
									<Skeleton key={i} className="h-4 w-full" />
								))}
							</div>
						</div>
						<div className="space-y-4">
							<Skeleton className="h-4 w-32" />
							<div className="space-y-2">
								{Array.from({ length: 6 }).map((_, i) => (
									<Skeleton key={i} className="h-4 w-full" />
								))}
							</div>
						</div>
					</div>
				</div>
				<div className="space-y-4">
					<Skeleton className="h-10 w-full border-b" />
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		</div>
	);
}
