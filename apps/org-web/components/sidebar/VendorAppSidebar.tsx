"use client";

import type { NavSidebarGroup } from "@repo/ui/general/NavSidebar";
import NavSidebar from "@repo/ui/general/NavSidebar";
import { useVendorSidebarItems } from "@/hooks/use-vendor-sidebar-items";
import SidebarLogo from "./SidebarLogo";

export function VendorAppSidebar() {
	const { items } = useVendorSidebarItems();

	const groups: NavSidebarGroup[] = items.map((group) => ({
		label: group.label || undefined,
		items: group.items.map((item) => ({
			label: item.label,
			icon: item.icon,
			link: item.link,
			external: item.external,
		})),
	}));

	return <NavSidebar sidebarHeader={<SidebarLogo />} groups={groups} />;
}
