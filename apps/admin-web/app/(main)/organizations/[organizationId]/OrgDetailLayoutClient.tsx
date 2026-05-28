"use client";

import PageContainer from "@repo/ui/general/PageContainer";
import { useParams } from "next/navigation";
import { OrganizationHeader } from "@/components/organizations/OrganizationHeader";
import { OrganizationNotFound } from "@/components/organizations/OrganizationNotFound";
import { OrgSidebar } from "@/components/sidebar/OrgSidebar";
import { useOrganization } from "@/queries/organizations.query";

type OrganizationDetailPageLayoutProps = {
	children: React.ReactNode;
};

function OrgDetailLayoutClient({
	children,
}: Readonly<OrganizationDetailPageLayoutProps>) {
	const params = useParams();
	const organizationId = params.organizationId as string;
	const { data: org } = useOrganization(organizationId);

	if (!org) {
		return <OrganizationNotFound />;
	}

	return (
		<div className="flex min-h-0 min-w-0 flex-1">
			<OrgSidebar organizationId={organizationId} />
			<PageContainer className="min-w-0">
				<div className="space-y-6">
					<OrganizationHeader organization={org} />
					{children}
				</div>
			</PageContainer>
		</div>
	);
}

export default OrgDetailLayoutClient;
