import LoadingScreen from "@repo/ui/general/LoadingScreen";

const Loading = () => {
	return (
		<div className="flex h-96 flex-col items-center justify-center gap-4">
			<LoadingScreen message="Loading departments..." />
		</div>
	);
};

export default Loading;
