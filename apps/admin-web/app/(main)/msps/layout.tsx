import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "MSPs",
};

type MspPageLayoutProps = {
	children: React.ReactNode;
};

function MspPageLayout({ children }: MspPageLayoutProps) {
	return (
		<PermissionsGuard permissions={[{ action: Action.Read, subject: "MSP" }]}>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
}

export default MspPageLayout;
