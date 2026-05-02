import type { Action, AppAbility, AppSubjects } from "@repo/casl";

/** Minimal shape for sidebar items used in CASL filtering. */
export type SidebarNavPermission = {
	action: Action;
	subject: AppSubjects;
};

export type SidebarNavItem = {
	permissions: SidebarNavPermission[];
	permissionsMatch?: "all" | "any";
};

export type SidebarNavGroup<T extends SidebarNavItem = SidebarNavItem> = {
	label: string;
	items: T[];
};

/**
 * Filters sidebar groups (and optional leading dashboard item) using CASL
 * `ability.can` — same rules as admin-web / org-web sidebars.
 */
export function filterSidebarGroupsByAbility<T extends SidebarNavItem>(
	ability: AppAbility,
	groups: SidebarNavGroup<T>[],
	options?: { dashboardItem?: T },
): SidebarNavGroup<T>[] {
	const result: SidebarNavGroup<T>[] = [];

	if (options?.dashboardItem) {
		const d = options.dashboardItem;
		const match = d.permissionsMatch ?? "all";
		const ok =
			match === "any"
				? d.permissions.some((p) => ability.can(p.action, p.subject))
				: d.permissions.every((p) => ability.can(p.action, p.subject));
		if (ok) {
			result.push({ label: "", items: [d] });
		}
	}

	for (const group of groups) {
		const groupItems = group.items.filter((item) => {
			const match = item.permissionsMatch ?? "all";
			return match === "any"
				? item.permissions.some((p) => ability.can(p.action, p.subject))
				: item.permissions.every((p) => ability.can(p.action, p.subject));
		});
		if (groupItems.length > 0) {
			result.push({ label: group.label, items: groupItems });
		}
	}

	return result;
}
