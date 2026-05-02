import { Action } from "@repo/casl";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

type OrganizationPageLayoutProps = {
	children: React.ReactNode;
};

function OrganizationPageLayout({ children }: OrganizationPageLayoutProps) {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Read, subject: "Organization" }]}
		>
			{children}
		</PermissionsGuard>
	);
}

export default OrganizationPageLayout;
