import type { Metadata } from "next";
import BillingPageContent from "@/components/organization-billing/BillingPageContent";

export const metadata: Metadata = {
	title: "Billing",
};

type PageProps = { params: Promise<{ organizationId: string }> };

export default async function Page({ params }: PageProps) {
	const { organizationId } = await params;
	return <BillingPageContent organizationId={organizationId} />;
}
