const ORG_CARD_SKELETON_KEYS = [
	"organizations-by-type-card-skeleton-a",
	"organizations-by-type-card-skeleton-b",
	"organizations-by-type-card-skeleton-c",
	"organizations-by-type-card-skeleton-d",
	"organizations-by-type-card-skeleton-e",
	"organizations-by-type-card-skeleton-f",
] as const;

export default function OrganizationsByTypeLoading() {
	return (
		<div className="space-y-6">
			<div className="h-8 w-48 animate-pulse rounded bg-muted" />
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{ORG_CARD_SKELETON_KEYS.map((skeletonKey) => (
					<div
						key={skeletonKey}
						className="h-32 animate-pulse rounded-lg border bg-muted"
					/>
				))}
			</div>
		</div>
	);
}
