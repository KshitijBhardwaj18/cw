import { OrganizationDetailsPageContent } from "@/components/organizations/OrganizationDetailsPageContent";

type OrganizationDetailPageProps = {
	params: Promise<{ organizationId: string }>;
};

export default async function OrganizationDetailPage({
	params,
}: Readonly<OrganizationDetailPageProps>) {
	const { organizationId } = await params;
	return <OrganizationDetailsPageContent organizationId={organizationId} />;
}
