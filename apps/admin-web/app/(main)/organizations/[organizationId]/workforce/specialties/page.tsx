import OrganizationSpecialtyPageContent from "@/components/organization-specialty/OrganizationSpecialtyPageContent";

type PageProps = { params: Promise<{ organizationId: string }> };

export default async function Page({ params }: PageProps) {
	const { organizationId } = await params;
	return <OrganizationSpecialtyPageContent organizationId={organizationId} />;
}
