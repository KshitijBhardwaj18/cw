import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Metrics",
};

type MetricsPageLayoutProps = {
	children: React.ReactNode;
};

function MetricsPageLayout({ children }: Readonly<MetricsPageLayoutProps>) {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Read, subject: "Metric" }]}
		>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
}

export default MetricsPageLayout;
