import { Loader2 } from "lucide-react";

type Props = {
	className?: string;
	message?: string;
	type?: "ping" | "spin";
};

const LoadingScreen = (props: Readonly<Props>) => {
	const { className, message, type = "spin" } = props;
	return (
		<div
			className={`flex gap-4 flex-col h-full w-full items-center justify-center ${className ?? ""}`}
		>
			<div className="relative inline-flex h-12 w-12 items-center justify-center">
				{type === "spin" ? (
					<Loader2 className="size-10 animate-spin text-primary" />
				) : (
					<>
						<div className="bg-primary/20 absolute inset-0 animate-ping rounded-full"></div>
						<div className="bg-primary relative h-6 w-6 rounded-full"></div>
					</>
				)}
			</div>
			{message && <p className="text-muted-foreground">{props.message}</p>}
		</div>
	);
};

export default LoadingScreen;
