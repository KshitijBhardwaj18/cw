"use client";

import PageContainer from "@repo/ui/general/PageContainer";
import { BillingAccessGuard } from "./BillingAccessGuard";

type BillingPageLayoutProps = {
	children: React.ReactNode;
};

export function BillingPageLayout({
	children,
}: Readonly<BillingPageLayoutProps>) {
	return (
		<BillingAccessGuard>
			<PageContainer>{children}</PageContainer>
		</BillingAccessGuard>
	);
}
