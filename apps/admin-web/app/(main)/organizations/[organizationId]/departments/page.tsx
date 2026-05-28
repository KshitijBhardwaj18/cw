import { OrganizationDepartmentsPageContent } from "@/components/organizations/OrganizationDepartmentsPageContent";

type OrganizationDepartmentsPageProps = {
	params: Promise<{ organizationId: string }>;
};

export default async function OrganizationDepartmentsPage({
	params,
}: Readonly<OrganizationDepartmentsPageProps>) {
	const { organizationId } = await params;
	return <OrganizationDepartmentsPageContent organizationId={organizationId} />;
}
