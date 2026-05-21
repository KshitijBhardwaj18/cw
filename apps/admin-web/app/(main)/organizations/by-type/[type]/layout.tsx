import PageContainer from "@repo/ui/general/PageContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Organizations by type",
};

type OrganizationsByTypePageLayoutProps = {
	children: React.ReactNode;
};

function OrganizationsByTypePageLayout({
	children,
}: OrganizationsByTypePageLayoutProps) {
	return <PageContainer>{children}</PageContainer>;
}

export default OrganizationsByTypePageLayout;
