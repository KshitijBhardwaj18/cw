import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Wallet",
};

export default function OrgDocumentWalletDetailLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
