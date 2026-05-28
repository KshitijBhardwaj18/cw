import PageContainer from "@repo/ui/general/PageContainer";
import type { Metadata } from "next";
import { BillingInvoiceAccessGuard } from "@/components/organization-billing/BillingInvoiceAccessGuard";

export const metadata: Metadata = {
	title: "Invoice",
};

export default function OrganizationBillingInvoiceLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<BillingInvoiceAccessGuard>
			<PageContainer>{children}</PageContainer>
		</BillingInvoiceAccessGuard>
	);
}
