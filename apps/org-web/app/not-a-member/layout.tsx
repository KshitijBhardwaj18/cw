import {
	formatStaffLogicDocumentTitle,
	ORGANIZATION_PORTAL_DISPLAY_NAME,
} from "@repo/shared";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: formatStaffLogicDocumentTitle(
		"Access denied",
		ORGANIZATION_PORTAL_DISPLAY_NAME,
	),
	description: "Your account is not a member of this organization.",
	robots: { index: false, follow: false },
};

export default function NotAMemberLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
