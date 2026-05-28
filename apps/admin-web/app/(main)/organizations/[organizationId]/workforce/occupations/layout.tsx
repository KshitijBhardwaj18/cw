import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Occupations",
};

export default function OrgWorkforceOccupationsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
