import { OrganizationLocationsPageContent } from "@/components/organizations/OrganizationLocationsPageContent";

type OrganizationLocationsPageProps = {
	params: Promise<{ organizationId: string }>;
};

export default async function OrganizationLocationsPage({
	params,
}: OrganizationLocationsPageProps) {
	const { organizationId } = await params;
	return <OrganizationLocationsPageContent organizationId={organizationId} />;
}
