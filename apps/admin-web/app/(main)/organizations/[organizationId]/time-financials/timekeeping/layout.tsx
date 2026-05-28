import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Timekeeping",
};

export default function OrganizationTimekeepingLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
