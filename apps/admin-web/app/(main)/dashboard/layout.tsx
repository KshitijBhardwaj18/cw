import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Read, subject: "Dashboard" }]}
		>
			<PageContainer className="space-y-8">{children}</PageContainer>
		</PermissionsGuard>
	);
};

export default DashboardLayout;
