import type { Metadata } from "next";
import BillingPageContent from "@/components/billing/BillingPageContent";

export const metadata: Metadata = {
	title: "Billing",
	description: "Manage your organization's billing and subscription",
};

const BillingPage = () => {
	return <BillingPageContent />;
};

export default BillingPage;
