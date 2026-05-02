import LoadingScreen from "@repo/ui/general/LoadingScreen";

export default function InvoiceDraftDetailLoading() {
	return (
		<div className="flex h-96 flex-col items-center justify-center gap-4">
			<LoadingScreen message="Loading invoice draft..." />
		</div>
	);
}
