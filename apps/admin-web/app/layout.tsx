import type { Metadata } from "next";
import "@repo/ui/globals.css";
import { dmSans } from "@repo/ui/lib/fonts";
import Providers from "./providers";

export const metadata: Metadata = {
	title: "Admin Portal | Staff Logic",
	description: "Admin portal for Staff Logic",
	icons: {
		icon: "/images/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${dmSans.className} antialiased`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
