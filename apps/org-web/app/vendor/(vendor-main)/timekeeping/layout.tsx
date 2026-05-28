import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";
import { VendorOrgBridge } from "@/components/vendor-layout/VendorOrgBridge";

export const metadata: Metadata = {
	title: "Timekeeping",
};

const TimekeepingLayout = ({
	children,
}: Readonly<{ children: React.ReactNode }>) => {
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
