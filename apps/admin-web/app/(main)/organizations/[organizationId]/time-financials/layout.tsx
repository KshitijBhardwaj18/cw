import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Time & Financials",
};

export default function OrganizationTimeFinancialsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
