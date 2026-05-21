import BillingPageContent from "@/components/organization-billing/BillingPageContent";

type PageProps = { params: Promise<{ organizationId: string }> };

export default async function Page({ params }: PageProps) {
	const { organizationId } = await params;
	return <BillingPageContent organizationId={organizationId} />;
}
