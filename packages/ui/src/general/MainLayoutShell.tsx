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
}: Readonly<MainLayoutShellProps>) => {
	return (
		<SidebarProvider>
			<div key="sidebar-mount" className="contents" data-slot="sidebar-mount">
				{sidebar}
			</div>
			<SidebarInset
				key="main-inset"
				className="flex h-dvh flex-col overflow-hidden"
			>
				<header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b pt-[env(safe-area-inset-top,0px)]">
					<div className="flex min-w-0 flex-1 items-center gap-1.5 px-2 sm:gap-2 sm:px-3">
						<SidebarTrigger className="shrink-0" />
						<Separator
							orientation="vertical"
							className="mr-1 hidden h-4 sm:mr-2 sm:block"
						/>
						<div className="min-w-0 truncate text-lg font-bold sm:text-xl md:text-2xl">
							{title}
						</div>
					</div>
					<div className="shrink-0">{headerActions}</div>
				</header>
				<div className="min-h-0 flex-1 overflow-auto">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default MainLayoutShell;
