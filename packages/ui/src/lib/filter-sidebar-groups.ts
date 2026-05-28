import {
	type Action,
	Action as ActionEnum,
	type AppAbility,
	type AppSubjects,
	subjectInstance,
} from "@repo/casl";

/** Minimal shape for sidebar items used in CASL filtering. */
export type SidebarNavPermission = {
	action: Action;
	subject: AppSubjects;
	/** When set, checks `ability.can` against a subject instance (e.g. Billing tab). */
	conditions?: Record<string, unknown>;
};

export type SidebarNavItem = {
	/** When set, used instead of `permissions` (e.g. billing page tab union). */
	canAccess?: (ability: AppAbility) => boolean;
	permissions?: SidebarNavPermission[];
	permissionsMatch?: "all" | "any";
};

export type SidebarNavGroup<T extends SidebarNavItem = SidebarNavItem> = {
	label: string;
	items: T[];
};

function resolveSubject(permission: SidebarNavPermission): AppSubjects {
	if (!permission.conditions) {
		return permission.subject;
	}
	return subjectInstance(
		permission.subject as AppSubjects & string,
		permission.conditions,
	);
}

/** Aligns with route guards that use Read or List interchangeably. */
function abilityAllows(
	ability: AppAbility,
	action: Action,
	subject: AppSubjects,
): boolean {
	if (ability.can(action, subject)) {
		return true;
	}
	if (action === ActionEnum.Read) {
		return ability.can(ActionEnum.List, subject);
	}
	if (action === ActionEnum.List) {
		return ability.can(ActionEnum.Read, subject);
	}
	return false;
}

function permissionPasses(
	ability: AppAbility,
	permission: SidebarNavPermission,
): boolean {
	return abilityAllows(ability, permission.action, resolveSubject(permission));
}

function itemPassesAbilityCheck(
	ability: AppAbility,
	item: SidebarNavItem,
): boolean {
	if (item.canAccess) {
		return item.canAccess(ability);
	}
	const permissions = item.permissions ?? [];
	if (permissions.length === 0) {
		return false;
	}
	const match = item.permissionsMatch ?? "all";
	return match === "any"
		? permissions.some((p) => permissionPasses(ability, p))
		: permissions.every((p) => permissionPasses(ability, p));
}

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

	if (
		options?.dashboardItem &&
		itemPassesAbilityCheck(ability, options.dashboardItem)
	) {
		result.push({ label: "", items: [options.dashboardItem] });
	}

	for (const group of groups) {
		const groupItems = group.items.filter((item) =>
			itemPassesAbilityCheck(ability, item),
		);
		if (groupItems.length > 0) {
			result.push({ label: group.label, items: groupItems });
		}
	}

	return result;
}
