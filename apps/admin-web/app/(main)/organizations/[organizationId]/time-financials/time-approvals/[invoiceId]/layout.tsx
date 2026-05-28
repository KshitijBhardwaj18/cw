import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Invoice",
};

export default function OrganizationTimeApprovalInvoiceLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
