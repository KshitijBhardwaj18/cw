import type { Metadata } from "next";
import { headers } from "next/headers";
import "@repo/ui/globals.css";
import { dmSans } from "@repo/ui/lib/fonts";
import { OrgContextProvider } from "@/contexts/org-context";
import type { OrgContext } from "@/types/org-context";
import Providers from "./providers";

export const metadata: Metadata = {
	title: "Organization Portal | Staff Logic",
	description: "Organization portal for Staff Logic",
	icons: {
		icon: "/images/favicon.ico",
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const headersList = await headers();
	const orgId = headersList.get("x-org-id");

	const content = orgId ? (
		<OrgContextProvider
			org={
				{
					id: orgId,
					name: headersList.get("x-org-name") ?? "",
					slug: headersList.get("x-org-slug") ?? "",
					logo: headersList.get("x-org-logo") ?? null,
					timeZone: headersList.get("x-org-timezone") ?? "",
					industry: headersList.get("x-org-industry") ?? "",
				} satisfies OrgContext
			}
		>
			{children}
		</OrgContextProvider>
	) : (
		children
	);

	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${dmSans.className} antialiased`}>
				<Providers>{content}</Providers>
			</body>
		</html>
	);
}
