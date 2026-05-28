import { OrganizationVendorsPageContent } from "@/components/organizations/OrganizationVendorsPageContent";

type OrganizationVendorsPageProps = {
	params: Promise<{ organizationId: string }>;
};

export default async function OrganizationVendorsPage({
	params,
}: Readonly<OrganizationVendorsPageProps>) {
	const { organizationId } = await params;
	return <OrganizationVendorsPageContent organizationId={organizationId} />;
}
