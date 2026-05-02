import LoadingScreen from "@repo/ui/general/LoadingScreen";

const Loading = () => {
	return (
		<div className="flex h-dvh items-center justify-center">
			<LoadingScreen type="ping" />
		</div>
	);
};

export default Loading;
