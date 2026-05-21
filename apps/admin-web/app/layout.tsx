import {
	ADMIN_PORTAL_DISPLAY_NAME,
	formatStaffLogicDocumentTitle,
	STAFF_LOGIC_BRAND_NAME,
	staffLogicDocumentTitleTemplate,
} from "@repo/shared";
import type { Metadata } from "next";
import "@repo/ui/globals.css";
import { dmSans } from "@repo/ui/lib/fonts";
import { envConfig } from "@/config";
import Providers from "./providers";

export const metadata: Metadata = {
	metadataBase: new URL(envConfig.appUrl),
	title: {
		default: formatStaffLogicDocumentTitle("Home", ADMIN_PORTAL_DISPLAY_NAME),
		template: staffLogicDocumentTitleTemplate(ADMIN_PORTAL_DISPLAY_NAME),
	},
	description: `Admin portal for ${STAFF_LOGIC_BRAND_NAME}`,
	applicationName: STAFF_LOGIC_BRAND_NAME,
	icons: {
		icon: "/images/favicon.ico",
	},
	openGraph: {
		siteName: STAFF_LOGIC_BRAND_NAME,
		type: "website",
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
