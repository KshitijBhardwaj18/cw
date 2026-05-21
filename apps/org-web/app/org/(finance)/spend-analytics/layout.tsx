import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Spend Analytics",
};

const SpendAnalyticsLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.List, subject: "SpendAnalytics" }]}
		>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
};

export default SpendAnalyticsLayout;
