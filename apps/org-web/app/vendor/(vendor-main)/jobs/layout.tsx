import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Jobs",
};

const JobsBoardLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.List, subject: "Requisition" }]}
		>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
};

export default JobsBoardLayout;
