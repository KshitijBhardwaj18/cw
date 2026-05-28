import {
	ORGANIZATION_PORTAL_DISPLAY_NAME,
	staffLogicDocumentTitleTemplate,
} from "@repo/shared";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: {
		default: "Sign in",
		template: staffLogicDocumentTitleTemplate(ORGANIZATION_PORTAL_DISPLAY_NAME),
	},
};

export default function SharedAuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
