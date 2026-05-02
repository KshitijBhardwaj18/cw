import { Skeleton } from "@repo/ui/components/skeleton";

export function TalentCommunityPageLoading() {
	return (
		<div className="min-w-0 max-w-full overflow-x-auto rounded-xl border bg-card">
			<div className="w-full min-w-[900px]">
				<div className="flex gap-4 border-b bg-muted p-4">
					{[
						"w-[16%]",
						"w-[12%]",
						"w-[12%]",
						"w-[12%]",
						"w-[12%]",
						"w-[18%]",
						"w-[8%]",
					].map((cn, i) => (
						<Skeleton key={i} className={`h-4 ${cn}`} />
					))}
				</div>
				<div className="divide-y">
					{Array.from({ length: 8 }).map((_, i) => (
						<div key={i} className="flex items-center gap-4 p-4">
							<div className="w-[16%] space-y-1">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-3 w-2/3" />
							</div>
							<Skeleton className="h-4 w-[12%]" />
							<Skeleton className="h-4 w-[12%]" />
							<Skeleton className="h-4 w-[12%]" />
							<Skeleton className="h-4 w-[12%]" />
							<div className="w-[18%] space-y-1">
								<Skeleton className="h-3 w-full" />
								<Skeleton className="h-3 w-1/2" />
							</div>
							<Skeleton className="h-8 w-[8%] rounded-md" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
