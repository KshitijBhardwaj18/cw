import { filterSidebarGroupsByAbility } from "@repo/ui/lib/filter-sidebar-groups";
import { useMemo } from "react";
import { orgSidebarGroups } from "@/constants/sidebar";
import { useAuth } from "@/contexts/auth.context";

export function useOrgSidebarItems() {
	const { ability } = useAuth();

	const items = useMemo(
		() => filterSidebarGroupsByAbility(ability, orgSidebarGroups),
		[ability],
	);

	return { items };
}
