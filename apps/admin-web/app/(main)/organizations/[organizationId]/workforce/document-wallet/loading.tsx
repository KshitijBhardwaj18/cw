import { Skeleton } from "@repo/ui/components/skeleton";

export default function DocumentWalletLoading() {
	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Skeleton className="h-12 w-72" />
				<Skeleton className="h-4 w-full max-w-xl" />
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
			</div>
			<div className="flex gap-4">
				<Skeleton className="h-10 flex-1" />
				<Skeleton className="h-10 w-44" />
			</div>
			<Skeleton className="h-64 w-full" />
		</div>
	);
}
