import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

const ShiftRoutingSettingsLayout = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.List, subject: "ShiftRoutingSettings" }]}
		>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
};

export default ShiftRoutingSettingsLayout;
