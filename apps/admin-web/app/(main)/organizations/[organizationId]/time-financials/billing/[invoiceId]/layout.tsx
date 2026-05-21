import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Invoice",
};

export default function OrganizationBillingInvoiceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
