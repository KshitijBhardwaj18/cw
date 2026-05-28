"use client";

import { filterSidebarGroupsByAbility } from "@repo/ui/lib/filter-sidebar-groups";
import { useMemo } from "react";
import { orgSidebarGroups } from "@/constants/org-sidebar";
import { useAuth } from "@/contexts";

export function useOrgSidebarItems() {
	const { ability } = useAuth();

	const groups = useMemo(
		() => filterSidebarGroupsByAbility(ability, orgSidebarGroups),
		[ability],
	);

	return { groups };
}
