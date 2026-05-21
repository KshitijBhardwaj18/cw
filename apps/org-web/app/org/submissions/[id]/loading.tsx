import { Skeleton } from "@repo/ui/components/skeleton";

export default function SubmissionDetailLoading() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-6 w-48" />
			<div className="space-y-2">
				<Skeleton className="h-8 w-72" />
				<Skeleton className="h-4 w-96 max-w-full" />
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Skeleton className="h-32 rounded-lg" />
				<Skeleton className="h-32 rounded-lg" />
			</div>
			<Skeleton className="h-64 rounded-lg" />
		</div>
	);
}
