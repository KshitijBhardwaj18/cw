import { Skeleton } from "@repo/ui/components/skeleton";

const MatchingLogicLoading = () => {
	return (
		<div className="space-y-6">
			<Skeleton className="h-10 w-48" />
			<Skeleton className="h-4 w-96" />
			<div className="grid gap-4">
				<Skeleton className="h-20" />
				<Skeleton className="h-60" />
				<Skeleton className="h-20" />
			</div>
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<Skeleton className="h-10 w-24" />
				<Skeleton className="h-10 w-24" />
			</div>
		</div>
	);
};

export default MatchingLogicLoading;
