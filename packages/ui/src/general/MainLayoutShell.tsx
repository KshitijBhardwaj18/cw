"use client";

import { Separator } from "@repo/ui/components/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@repo/ui/components/sidebar";
import type React from "react";

export type MainLayoutShellProps = {
	sidebar: React.ReactNode;
	title: string;
	headerActions?: React.ReactNode;
	children: React.ReactNode;
};

const MainLayoutShell = ({
	sidebar,
	title,
	headerActions,
	children,
}: MainLayoutShellProps) => {
	return (
		<SidebarProvider>
			<div key="sidebar-mount" className="contents" data-slot="sidebar-mount">
				{sidebar}
			</div>
			<SidebarInset
				key="main-inset"
				className="flex h-dvh flex-col overflow-hidden"
			>
				<header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b">
					<div className="flex items-center gap-2 px-3">
						<SidebarTrigger />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<h1 className="text-2xl font-bold">{title}</h1>
					</div>
					{headerActions}
				</header>
				<div className="min-h-0 flex-1 overflow-auto">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default MainLayoutShell;
