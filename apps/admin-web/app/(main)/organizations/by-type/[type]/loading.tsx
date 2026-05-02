export default function OrganizationsByTypeLoading() {
	return (
		<div className="space-y-6">
			<div className="h-8 w-48 animate-pulse rounded bg-muted" />
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="h-32 animate-pulse rounded-lg border bg-muted"
					/>
				))}
			</div>
		</div>
	);
}
