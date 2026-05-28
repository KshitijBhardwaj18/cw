import BillingPageContent from "@/components/organization-billing/BillingPageContent";

type PageProps = { params: Promise<{ organizationId: string }> };

export default async function Page({ params }: Readonly<PageProps>) {
	const { organizationId } = await params;
	return <BillingPageContent organizationId={organizationId} />;
}
