import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Vendors",
};

export default function OrganizationVendorsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
