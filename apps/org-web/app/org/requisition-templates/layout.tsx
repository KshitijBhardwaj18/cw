import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

const RequisitionTemplatesLayout = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.List, subject: "RequisitionTemplate" }]}
		>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
};

export default RequisitionTemplatesLayout;
