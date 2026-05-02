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
	SidebarRail,
} from "@repo/ui/components/sidebar";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";

export type NavSidebarItem = {
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	link: string;
	external?: boolean;
};

export type NavSidebarGroup = {
	label?: string;
	items: NavSidebarItem[];
};

export type NavSidebarProps = {
	sidebarHeader: React.ReactNode;
	groups: NavSidebarGroup[];
};

const NavSidebar = ({ sidebarHeader, groups }: NavSidebarProps) => {
	const pathname = usePathname();

	return (
		<Sidebar collapsible="icon">
			{sidebarHeader}
			<SidebarContent>
				{groups.map((group) =>
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
										<SidebarMenu>
											{group.items.map((item) => (
												<SidebarMenuItem key={item.label}>
													<SidebarMenuButton
														asChild
														tooltip={item.label}
														size="lg"
														isActive={
															pathname === item.link ||
															pathname.startsWith(`${item.link}/`)
														}
													>
														<Link
															href={item.link}
															target={item.external ? "_blank" : undefined}
														>
															<item.icon className="size-4" />
															<span>{item.label}</span>
														</Link>
													</SidebarMenuButton>
												</SidebarMenuItem>
											))}
										</SidebarMenu>
									</SidebarGroupContent>
								</CollapsibleContent>
							</SidebarGroup>
						</Collapsible>
					) : (
						<SidebarGroup
							key={`ungrouped-${group.items[0]?.label ?? "ungrouped"}`}
							className="px-2 py-0.5"
						>
							<SidebarGroupContent>
								<SidebarMenu>
									{group.items.map((item) => (
										<SidebarMenuItem key={item.label}>
											<SidebarMenuButton
												asChild
												tooltip={item.label}
												size="lg"
												isActive={item.link === pathname}
											>
												<Link
													href={item.link}
													target={item.external ? "_blank" : undefined}
												>
													<item.icon className="size-4" />
													<span>{item.label}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					),
				)}
			</SidebarContent>
			<SidebarRail key="nav-sidebar-rail" />
		</Sidebar>
	);
};

export default NavSidebar;
