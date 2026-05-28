"use client";

import MainLayoutShell from "@repo/ui/general/MainLayoutShell";
import type { ReactNode } from "react";
import HeaderUserMenu from "@/components/header/HeaderUserMenu";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { useOptionalOrgContext } from "@/contexts/org-context";

export default function OrgMainShellWithContext({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const org = useOptionalOrgContext();
	const name = org?.name?.trim();
	const title = name ? name : "Organization Portal";

	return (
		<MainLayoutShell
			sidebar={<AppSidebar />}
			title={title}
			headerActions={<HeaderUserMenu profileLink="/org/profile" />}
		>
			{children}
		</MainLayoutShell>
	);
}
