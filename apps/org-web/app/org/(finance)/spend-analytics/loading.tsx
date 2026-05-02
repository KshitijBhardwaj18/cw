import LoadingScreen from "@repo/ui/general/LoadingScreen";

export default function SpendAnalyticsLoading() {
	return (
		<div className="flex h-96 flex-col items-center justify-center gap-4">
			<LoadingScreen message="Loading spend analytics..." />
		</div>
	);
}
