import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

type NewOrganizationPageLayoutProps = {
	children: React.ReactNode;
};

function NewOrganizationPageLayout({
	children,
}: NewOrganizationPageLayoutProps) {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Create, subject: "Organization" }]}
		>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
}

export default NewOrganizationPageLayout;
