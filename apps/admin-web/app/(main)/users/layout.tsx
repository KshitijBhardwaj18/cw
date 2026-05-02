import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

export default function UsersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<PermissionsGuard permissions={[{ action: Action.Read, subject: "User" }]}>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
}
