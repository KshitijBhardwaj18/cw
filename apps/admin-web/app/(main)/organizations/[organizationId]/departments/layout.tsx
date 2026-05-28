import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Departments",
};

export default function OrganizationDepartmentsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
