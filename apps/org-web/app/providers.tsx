"use client";
import { Toaster } from "@repo/ui/components/sonner";
import { ThemeProvider } from "@repo/ui/components/theme-provider";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactQueryClientProvider } from "@/lib/tanstack-query";

const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="light"
			disableTransitionOnChange
		>
			<ReactQueryClientProvider>
				<NuqsAdapter>
					<Toaster
						duration={2500}
						richColors
						closeButton
						position="top-right"
					/>
					<TooltipProvider>{children}</TooltipProvider>
					{process.env.NODE_ENV === "development" && (
						<ReactQueryDevtools initialIsOpen={false} />
					)}
				</NuqsAdapter>
			</ReactQueryClientProvider>
		</ThemeProvider>
	);
};

export default Providers;
