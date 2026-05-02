import { filterSidebarGroupsByAbility } from "@repo/ui/lib/filter-sidebar-groups";
import { useMemo } from "react";
import { dashboardItem, sidebarGroups } from "@/constants/sidebar";
import { useAuth } from "@/contexts/auth.context";

export const useSidebarItems = () => {
	const { ability } = useAuth();
	const items = useMemo(
		() =>
			filterSidebarGroupsByAbility(ability, sidebarGroups, {
				dashboardItem,
			}),
		[ability],
	);

	return { items };
};
