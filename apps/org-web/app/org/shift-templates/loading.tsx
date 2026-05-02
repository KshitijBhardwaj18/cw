import LoadingScreen from "@repo/ui/general/LoadingScreen";

const ShiftTemplatesLoading = () => {
	return (
		<div className="flex h-96 flex-col items-center justify-center gap-4">
			<LoadingScreen message="Loading shift templates..." />
		</div>
	);
};

export default ShiftTemplatesLoading;
