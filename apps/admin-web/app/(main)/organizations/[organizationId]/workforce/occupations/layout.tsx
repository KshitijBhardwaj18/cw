import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Occupations",
};

export default function OrgWorkforceOccupationsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
