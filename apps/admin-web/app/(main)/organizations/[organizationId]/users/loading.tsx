import { Skeleton } from "@repo/ui/components/skeleton";

export default function OrganizationUsersLoading() {
	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<Skeleton className="h-8 w-72" />
				<Skeleton className="h-4 w-96" />
			</div>
			<Skeleton className="h-20 w-full rounded-lg" />
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<Skeleton className="h-10 w-64" />
				<div className="flex gap-2">
					<Skeleton className="h-9 w-32" />
					<Skeleton className="h-9 w-28" />
				</div>
			</div>
			<div className="space-y-2">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		</div>
	);
}
