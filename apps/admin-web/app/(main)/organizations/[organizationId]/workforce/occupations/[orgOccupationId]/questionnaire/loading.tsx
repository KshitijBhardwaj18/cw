import { Skeleton } from "@repo/ui/components/skeleton";

const QuestionnaireLoading = () => {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton className="h-10 w-44" />
					<Skeleton className="h-4 w-80" />
				</div>
				<div>
					<Skeleton className="h-4 w-40" />
				</div>
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
				<Skeleton className="h-40" />
			</div>
			<div className="flex justify-between flex-wrap items-center">
				<Skeleton className="h-10 w-44" />
				<Skeleton className="h-10 w-44" />
			</div>
			<Skeleton className="h-90" />
		</div>
	);
};

export default QuestionnaireLoading;
