import { Skeleton } from "@repo/ui/components/skeleton";

const DashboardLoading = () => {
	return (
		<>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-5">
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
			</div>
			<div className="mt-24">
				<Skeleton className="h-28" />
			</div>
		</>
	);
};

export default DashboardLoading;
