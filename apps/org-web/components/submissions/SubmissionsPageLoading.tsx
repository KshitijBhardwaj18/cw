import { Skeleton } from "@repo/ui/components/skeleton";

export function SubmissionsPageLoading() {
	return (
		<div className="min-w-0 max-w-full overflow-x-auto rounded-xl border bg-card">
			<div className="w-full min-w-[800px]">
				<div className="flex gap-4 border-b bg-muted p-4">
					<Skeleton className="h-4 w-[10%]" />
					<Skeleton className="h-4 w-[15%]" />
					<Skeleton className="h-4 w-[15%]" />
					<Skeleton className="h-4 w-[15%]" />
					<Skeleton className="h-4 w-[15%]" />
					<Skeleton className="h-4 w-[10%]" />
					<Skeleton className="h-4 w-[10%]" />
					<Skeleton className="h-4 w-[10%]" />
				</div>
				<div className="divide-y">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="flex items-center gap-4 p-4">
							<Skeleton className="h-4 w-[10%]" />
							<div className="flex w-[15%] flex-col gap-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-3 w-2/3" />
							</div>
							<div className="flex w-[15%] flex-col gap-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-3 w-2/3" />
							</div>
							<div className="flex w-[15%] flex-col gap-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-3 w-2/3" />
							</div>
							<Skeleton className="h-4 w-[15%]" />
							<div className="flex w-[10%] flex-col gap-2">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-3 w-2/3" />
							</div>
							<Skeleton className="h-4 w-[10%]" />
							<Skeleton className="h-8 w-[10%] rounded-md" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
