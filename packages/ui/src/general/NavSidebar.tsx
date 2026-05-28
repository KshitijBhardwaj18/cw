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
	useSidebar,
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

/** True when pathname is exactly `link` or a nested segment under it. */
function navLinkMatchesPath(pathname: string, link: string): boolean {
	return pathname === link || pathname.startsWith(`${link}/`);
}

/**
 * When several sibling links match (e.g. `/organizations` and `/organizations/new`),
 * only the longest prefix should be active.
 */
function getMostSpecificActiveLink(
	pathname: string,
	links: readonly string[],
): string | null {
	let best: string | null = null;
	for (const link of links) {
		if (!navLinkMatchesPath(pathname, link)) {
			continue;
		}
		if (best === null || link.length > best.length) {
			best = link;
		}
	}
	return best;
}

const NavSidebar = ({ sidebarHeader, groups }: Readonly<NavSidebarProps>) => {
	const pathname = usePathname();
	const { state, isMobile } = useSidebar();
	const useCollapsibleGroups = !(state === "collapsed" && !isMobile);

	return (
		<Sidebar collapsible="icon">
			{sidebarHeader}
			<SidebarContent className="pt-3">
				{groups.map((group) => {
					if (group.label) {
						const activeLink = getMostSpecificActiveLink(
							pathname,
							group.items.map((i) => i.link),
						);
						const groupMenu = (
							<SidebarMenu>
								{group.items.map((item) => (
									<SidebarMenuItem key={item.label}>
										<SidebarMenuButton
											asChild
											tooltip={item.label}
											size="lg"
											isActive={activeLink === item.link}
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
						);

						if (!useCollapsibleGroups) {
							return (
								<SidebarGroup key={group.label} className="px-2 py-0.5">
									<SidebarGroupContent>{groupMenu}</SidebarGroupContent>
								</SidebarGroup>
							);
						}

						return (
							<Collapsible key={group.label} defaultOpen asChild>
								<SidebarGroup className="px-2 py-0.5">
									<SidebarGroupLabel asChild>
										<CollapsibleTrigger className="flex w-full items-center justify-between [&[data-state=open]>svg]:rotate-90">
											{group.label}
											<ChevronRight className="ml-auto size-4 transition-transform" />
										</CollapsibleTrigger>
									</SidebarGroupLabel>
									<CollapsibleContent>
										<SidebarGroupContent>{groupMenu}</SidebarGroupContent>
									</CollapsibleContent>
								</SidebarGroup>
							</Collapsible>
						);
					}

					const activeLinkUngrouped = getMostSpecificActiveLink(
						pathname,
						group.items.map((i) => i.link),
					);

					return (
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
												isActive={activeLinkUngrouped === item.link}
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
					);
				})}
			</SidebarContent>
			<SidebarRail key="nav-sidebar-rail" />
		</Sidebar>
	);
};

export default NavSidebar;
