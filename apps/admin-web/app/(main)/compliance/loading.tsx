import LoadingScreen from "@repo/ui/general/LoadingScreen";

const Loading = () => {
	return (
		<div className="flex h-96 items-center justify-center flex-col gap-4">
			<LoadingScreen message="Loading Compliance List Items..." />
		</div>
	);
};

export default Loading;
