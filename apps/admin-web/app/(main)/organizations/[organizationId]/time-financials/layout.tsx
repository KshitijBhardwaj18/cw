import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Time & Financials",
};

export default function OrganizationTimeFinancialsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
