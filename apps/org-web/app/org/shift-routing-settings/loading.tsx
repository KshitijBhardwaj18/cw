import LoadingScreen from "@repo/ui/general/LoadingScreen";

const ShiftRoutingSettingsLoading = () => {
	return (
		<div className="flex h-96 flex-col items-center justify-center gap-4">
			<LoadingScreen message="Loading shift routing settings..." />
		</div>
	);
};

export default ShiftRoutingSettingsLoading;
