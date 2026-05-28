import OrganizationTimekeepingPageContent from "@/components/organization-timekeeping/OrganizationTimekeepingPageContent";

type OrganizationTimekeepingPageProps = {
	params: Promise<{ organizationId: string }>;
};

export default async function OrganizationTimekeepingPage({
	params,
}: Readonly<OrganizationTimekeepingPageProps>) {
	const { organizationId } = await params;
	return <OrganizationTimekeepingPageContent organizationId={organizationId} />;
}
