import { Action } from "@repo/casl";
import PageContainer from "@repo/ui/general/PageContainer";
import PermissionsGuard from "@repo/ui/general/PermissionsGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Tags",
};

type TagsPageLayoutProps = {
	children: React.ReactNode;
};

function TagsPageLayout({ children }: Readonly<TagsPageLayoutProps>) {
	return (
		<PermissionsGuard permissions={[{ action: Action.Read, subject: "Tag" }]}>
			<PageContainer>{children}</PageContainer>
		</PermissionsGuard>
	);
}

export default TagsPageLayout;
