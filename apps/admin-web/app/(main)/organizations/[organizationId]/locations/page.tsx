import { OrganizationLocationsPageContent } from "@/components/organizations/OrganizationLocationsPageContent";

type OrganizationLocationsPageProps = {
	params: Promise<{ organizationId: string }>;
};

export default async function OrganizationLocationsPage({
	params,
}: Readonly<OrganizationLocationsPageProps>) {
	const { organizationId } = await params;
	return <OrganizationLocationsPageContent organizationId={organizationId} />;
}
