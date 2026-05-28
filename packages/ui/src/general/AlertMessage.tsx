import { cn } from "@repo/ui/lib/utils";
import { AlertCircle, CheckCircle } from "lucide-react";

interface AlertMessageProps {
	message: string;
	variant?: "default" | "destructive" | "info" | "success";
}

const AlertMessage = ({ message, variant }: Readonly<AlertMessageProps>) => {
	const variants = {
		default: {
			className: "text-yellow-800 border-yellow-500/10 bg-yellow-500/10",
			icon: (
				<AlertCircle
					className="size-4 shrink-0 text-yellow-800"
					strokeWidth={2}
				/>
			),
		},
		destructive: {
			className: "text-destructive border-destructive/10 bg-destructive/10",
			icon: (
				<AlertCircle
					className="text-destructive size-4 shrink-0"
					strokeWidth={2}
				/>
			),
		},
		info: {
			className: "text-blue-800 border-blue-500/10 bg-blue-500/10",
			icon: (
				<AlertCircle
					className="size-4 shrink-0 text-blue-800"
					strokeWidth={2}
				/>
			),
		},
		success: {
			className: "text-green-800 border-green-500/10 bg-green-500/10",
			icon: (
				<CheckCircle
					className="size-4 shrink-0 text-green-800"
					strokeWidth={2}
				/>
			),
		},
	};
	const variantClass = variants[variant || "default"];
	return (
		<div
			className={cn(
				"text-primary flex items-center justify-center gap-2 rounded-lg border-2 p-2 text-sm",
				variantClass.className,
			)}
		>
			{variantClass.icon} <span>{message}</span>
		</div>
	);
};

export default AlertMessage;
