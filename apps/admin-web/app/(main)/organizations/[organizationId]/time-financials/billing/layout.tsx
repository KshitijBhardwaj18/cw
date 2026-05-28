import type { Metadata } from "next";
import { BillingPageLayout } from "@/components/organization-billing/BillingPageLayout";

export const metadata: Metadata = {
	title: "Billing",
};

export default function OrganizationBillingLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <BillingPageLayout>{children}</BillingPageLayout>;
}
