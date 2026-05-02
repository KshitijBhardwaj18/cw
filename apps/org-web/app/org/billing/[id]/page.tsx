import type { Metadata } from "next";
import BillingInvoicePageContent from "@/components/billing/BillingInvoicePageContent";

export const metadata: Metadata = {
	title: "Billing",
	description: "Manage your organization's billing and subscription",
};

const BillingPage = () => {
	return <BillingInvoicePageContent />;
};

export default BillingPage;
