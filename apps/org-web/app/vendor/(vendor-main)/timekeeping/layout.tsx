import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import { VendorOrgBridge } from "@/components/vendor-layout/VendorOrgBridge";

const TimekeepingLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.List, subject: "Timesheet" }]}
		>
			<PageContainer>
				<VendorOrgBridge>{children}</VendorOrgBridge>
			</PageContainer>
		</PermissionsGuard>
	);
};

export default TimekeepingLayout;
