import { Skeleton } from "@repo/ui/components/skeleton";

export function SummarySkeleton() {
	return (
		<div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="h-10 w-36" />
			</div>
			<div className="mt-6 space-y-4 rounded-lg border bg-muted/30 p-4">
				<div className="flex justify-between">
					<Skeleton className="h-4 w-40" />
					<Skeleton className="h-4 w-24" />
				</div>
				<Skeleton className="h-2 w-full" />
				<div className="flex gap-4">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-24" />
				</div>
			</div>
		</div>
	);
}

function DocumentRequirementCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-xl border bg-card shadow-sm">
			<div className="p-4 space-y-3">
				<div className="flex gap-3">
					<Skeleton className="size-10 rounded-md" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-5 w-1/2" />
						<Skeleton className="h-4 w-3/4" />
					</div>
				</div>
				<Skeleton className="h-5 w-24 rounded-full" />
			</div>
			<div className="border-t p-4 bg-muted/20">
				<Skeleton className="h-10 w-full rounded-md" />
			</div>
		</div>
	);
}

function CategorySkeleton() {
	return (
		<div className="overflow-hidden rounded-lg border bg-card shadow-sm">
			<div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
				<div className="flex items-center gap-2">
					<Skeleton className="size-5 rounded" />
					<div className="space-y-1">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="h-4 w-20" />
					</div>
				</div>
				<div className="flex items-center gap-3">
					<Skeleton className="h-4 w-12" />
					<Skeleton className="h-9 w-24 rounded-md" />
				</div>
			</div>
			<div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
				{[1, 2].map((i) => (
					<DocumentRequirementCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}

export function ItemsSkeleton() {
	return (
		<div className="space-y-4">
			{[1, 2].map((i) => (
				<CategorySkeleton key={i} />
			))}
		</div>
	);
}

export function DocumentWalletSkeleton() {
	return (
		<div className="space-y-6">
			<SummarySkeleton />
			<div className="flex gap-4">
				<Skeleton className="h-10 flex-1" />
				<Skeleton className="h-10 w-24" />
			</div>
			<ItemsSkeleton />
		</div>
	);
}
