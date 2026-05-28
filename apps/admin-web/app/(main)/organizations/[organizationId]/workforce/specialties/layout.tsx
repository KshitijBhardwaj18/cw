import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Specialties",
};

export default function OrgWorkforceSpecialtiesLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
