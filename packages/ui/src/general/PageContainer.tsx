import { cn } from "@repo/ui/lib/utils";
import type React from "react";

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
}

const PageContainer = ({
	children,
	className,
}: Readonly<PageContainerProps>) => {
	return (
		<div
			className={cn(
				"mx-auto w-full max-w-5xl px-3 pt-3 sm:px-4 sm:pt-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8",
				"pb-[max(0.75rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))] sm:pb-[max(1rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))] md:pb-[max(1.5rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))] lg:pb-[max(2rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))]",
				className,
			)}
		>
			{children}
		</div>
	);
};

export default PageContainer;
