import {
	formatStaffLogicDocumentTitle,
	ORGANIZATION_PORTAL_DISPLAY_NAME,
	STAFF_LOGIC_BRAND_NAME,
} from "@repo/shared";
import type { Metadata } from "next";
import { headers } from "next/headers";
import "@repo/ui/globals.css";
import { dmSans } from "@repo/ui/lib/fonts";
import { envConfig } from "@/config";
import { OrgContextProvider } from "@/contexts/org-context";
import type { OrgContext } from "@/types/org-context";
import Providers from "./providers";

export const metadata: Metadata = {
	metadataBase: new URL(envConfig.landingUrl),
	title: formatStaffLogicDocumentTitle(
		"Welcome",
		ORGANIZATION_PORTAL_DISPLAY_NAME,
	),
	description: `Workforce and organization portal for ${STAFF_LOGIC_BRAND_NAME}`,
	applicationName: STAFF_LOGIC_BRAND_NAME,
	icons: {
		icon: "/images/favicon.ico",
	},
	openGraph: {
		siteName: STAFF_LOGIC_BRAND_NAME,
		type: "website",
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const headersList = await headers();
	const orgSlug = headersList.get("x-org-slug");

	const content = orgSlug ? (
		<OrgContextProvider
			org={
				{
					name: headersList.get("x-org-name") ?? "",
					slug: orgSlug,
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
