import { Skeleton } from "@repo/ui/components/skeleton";

const OrganizationOccupationsLoading = () => {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-10 w-44" />
					<Skeleton className="h-4 w-80" />
				</div>
				<Skeleton className="h-8 w-44" />
			</div>
			<Skeleton className="h-90" />
		</div>
	);
};

export default OrganizationOccupationsLoading;
