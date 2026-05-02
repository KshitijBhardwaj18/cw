import { OrganizationUserEnrollmentPageContent } from "@/components/organizations/OrganizationUserEnrollmentPageContent";

type OrganizationUsersPageProps = {
	params: Promise<{ organizationId: string }>;
};

export default async function OrganizationUsersPage({
	params,
}: OrganizationUsersPageProps) {
	const { organizationId } = await params;
	return (
		<OrganizationUserEnrollmentPageContent organizationId={organizationId} />
	);
}
