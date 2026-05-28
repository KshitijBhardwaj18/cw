import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Locations",
};

export default function OrganizationLocationsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
