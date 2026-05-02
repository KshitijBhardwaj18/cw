import LoadingScreen from "@repo/ui/general/LoadingScreen";

const ShiftsLoading = () => {
	return (
		<div className="flex h-96 flex-col items-center justify-center gap-4">
			<LoadingScreen message="Loading shifts..." />
		</div>
	);
};

export default ShiftsLoading;
