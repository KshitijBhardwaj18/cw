import OrganizationOccupationPageContent from "@/components/organization-occupation/OrganizationOccupationPageContent";

type PageProps = { params: Promise<{ organizationId: string }> };

export default async function OrganizationOccupationsPage({
	params,
}: Readonly<PageProps>) {
	const { organizationId } = await params;
	return <OrganizationOccupationPageContent organizationId={organizationId} />;
}
