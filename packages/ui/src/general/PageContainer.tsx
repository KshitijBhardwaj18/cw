import { cn } from "@repo/ui/lib/utils";
import type React from "react";

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
}

const PageContainer = ({ children, className }: PageContainerProps) => {
	return (
		<div
			className={cn(
				"mx-auto w-full max-w-5xl p-3 sm:p-4 md:p-6 lg:p-8",
				className,
			)}
		>
			{children}
		</div>
	);
};

export default PageContainer;
