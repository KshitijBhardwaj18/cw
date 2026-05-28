import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Users",
};

export default function OrganizationUsersLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
