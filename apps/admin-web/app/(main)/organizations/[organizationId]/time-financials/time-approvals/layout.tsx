import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Time Approvals",
};

export default function OrganizationTimeApprovalsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
