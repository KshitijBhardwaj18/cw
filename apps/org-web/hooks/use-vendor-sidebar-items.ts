import { filterSidebarGroupsByAbility } from "@repo/ui/lib/filter-sidebar-groups";
import { useMemo } from "react";
import { vendorSidebarGroups } from "@/constants/vendor/sidebar";
import { useAuth } from "@/contexts/auth.context";

export function useVendorSidebarItems() {
	const { ability } = useAuth();

	const items = useMemo(
		() => filterSidebarGroupsByAbility(ability, vendorSidebarGroups),
		[ability],
	);

	return { items };
}
