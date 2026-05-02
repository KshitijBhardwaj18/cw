import { OrganizationsByTypePageContent } from "@/components/organizations/OrganizationsByTypePageContent";

type OrganizationsByTypePageProps = {
	params: Promise<{ type: string }>;
};

export default async function OrganizationsByTypePage({
	params,
}: OrganizationsByTypePageProps) {
	const { type } = await params;
	return <OrganizationsByTypePageContent organizationType={type} />;
}
