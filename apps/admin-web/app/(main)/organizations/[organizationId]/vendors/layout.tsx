import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Vendors",
};

export default function OrganizationVendorsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
