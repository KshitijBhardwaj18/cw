import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Workforce Management",
};

export default function OrganizationWorkforceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
