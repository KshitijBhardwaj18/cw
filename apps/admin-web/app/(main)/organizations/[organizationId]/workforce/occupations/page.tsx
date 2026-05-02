import OrganizationOccupationPageContent from "@/components/organization-occupation/OrganizationOccupationPageContent";

type PageProps = { params: Promise<{ organizationId: string }> };

export default async function OrganizationOccupationsPage({
	params,
}: PageProps) {
	const { organizationId } = await params;
	return <OrganizationOccupationPageContent organizationId={organizationId} />;
}
