import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Jobs",
};

const JobsLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<PermissionsGuard
			match="any"
			permissions={[
				{ action: Action.List, subject: "Requisition" },
				{ action: Action.List, subject: "RequisitionApprovals" },
			]}
		>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
};

export default JobsLayout;
