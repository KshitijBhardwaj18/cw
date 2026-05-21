import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Timekeeping",
};

export default function OrganizationTimekeepingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
