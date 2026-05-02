import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

const UsersLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<PermissionsGuard permissions={[{ action: Action.List, subject: "User" }]}>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
};

export default UsersLayout;
