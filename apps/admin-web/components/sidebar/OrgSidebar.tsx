"use client";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@repo/ui/components/sidebar";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type {
	OrgSidebarGroup as OrgSidebarGroupType,
	OrgSidebarItem,
} from "@/constants/org-sidebar";
import { orgSidebarItems } from "@/constants/org-sidebar";

type OrgSidebarMenuItemsProps = {
	items: OrgSidebarItem[];
	basePath: string;
	isActive: (path: string) => boolean;
};

function OrgSidebarMenuItems({
	items,
	basePath,
	isActive,
}: OrgSidebarMenuItemsProps) {
	return (
		<SidebarMenu>
			{items.map((item) => (
				<SidebarMenuItem key={item.label}>
					<SidebarMenuButton
						asChild
						tooltip={item.label}
						size="default"
						isActive={isActive(item.path)}
					>
						<Link href={item.path ? `${basePath}${item.path}` : basePath}>
							<item.icon className="size-4" />
							<span>{item.label}</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
		</SidebarMenu>
	);
}

type OrgSidebarProps = {
	organizationId: string;
};

export function OrgSidebar({ organizationId }: OrgSidebarProps) {
	const pathname = usePathname();
	const basePath = `/organizations/${organizationId}`;

	const isActive = (itemPath: string) => {
		const fullPath = itemPath ? `${basePath}${itemPath}` : basePath;
		// Match exact or path prefix for nested routes
		if (itemPath === "") {
			return pathname === basePath || pathname === `${basePath}/`;
		}
		return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
	};

	return (
		<Sidebar
			collapsible="none"
			className="border-r w-56 shrink-0 sticky h-[calc(100vh-56px)] top-0"
		>
			<SidebarContent>
				{orgSidebarItems.map((group: OrgSidebarGroupType) =>
					group.label ? (
						<Collapsible key={group.label} defaultOpen asChild>
							<SidebarGroup className="px-2 py-0.5">
								<SidebarGroupLabel asChild>
									<CollapsibleTrigger className="flex w-full items-center justify-between [&[data-state=open]>svg]:rotate-90">
										{group.label}
										<ChevronRight className="ml-auto size-4 transition-transform" />
									</CollapsibleTrigger>
								</SidebarGroupLabel>
								<CollapsibleContent>
									<SidebarGroupContent>
										<OrgSidebarMenuItems
											items={group.items}
											basePath={basePath}
											isActive={isActive}
										/>
									</SidebarGroupContent>
								</CollapsibleContent>
							</SidebarGroup>
						</Collapsible>
					) : (
						<SidebarGroup key="ungrouped" className="px-2 py-0.5">
							<SidebarGroupContent>
								<OrgSidebarMenuItems
									items={group.items}
									basePath={basePath}
									isActive={isActive}
								/>
							</SidebarGroupContent>
						</SidebarGroup>
					),
				)}
			</SidebarContent>
		</Sidebar>
	);
}
