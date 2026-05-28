import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Matching Logic",
};

export default function OrgMatchingLogicLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
