import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";

type MetricsPageLayoutProps = {
	children: React.ReactNode;
};

function MetricsPageLayout({ children }: MetricsPageLayoutProps) {
	return (
		<PermissionsGuard
			permissions={[{ action: Action.Read, subject: "Metric" }]}
		>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
}

export default MetricsPageLayout;
