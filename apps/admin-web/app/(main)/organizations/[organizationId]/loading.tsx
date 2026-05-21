import { Skeleton } from "@repo/ui/components/skeleton";

export default function OrganizationDetailLoading() {
	return (
		<div className="space-y-6">
			<div className="flex items-start gap-4">
				<Skeleton className="size-10 shrink-0" />
				<div className="flex items-center gap-4">
					<Skeleton className="size-16 rounded-xl" />
					<div className="space-y-2">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
			</div>
			<div className="space-y-4">
				<Skeleton className="h-6 w-24" />
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Skeleton className="h-20" />
					<Skeleton className="h-20" />
				</div>
			</div>
		</div>
	);
}
