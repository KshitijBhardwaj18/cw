import type { AppAbility } from "../types/ability";
import { Action } from "../types/actions";
import type { AppSubjects } from "../types/subjects";
import { subjectInstance } from "./subject-instance";

export type TabAbilityCheck =
	| AppSubjects
	| {
			subject: AppSubjects;
			conditions?: Record<string, unknown>;
	  };

function canReadOrList(ability: AppAbility, subj: AppSubjects): boolean {
	return ability.can(Action.Read, subj) || ability.can(Action.List, subj);
}

function isObjectCheck(
	value: TabAbilityCheck,
): value is { subject: AppSubjects; conditions?: Record<string, unknown> } {
	return (
		typeof value === "object" &&
		value !== null &&
		"subject" in (value as Record<string, unknown>)
	);
}

export function filterReadableTabs<T extends string>(
	ability: AppAbility,
	orderedTabs: readonly T[],
	checkByTab: Record<T, TabAbilityCheck>,
): T[] {
	return orderedTabs.filter((tab) => {
		const entry = checkByTab[tab];
		if (!isObjectCheck(entry)) {
			return canReadOrList(ability, entry);
		}
		if (!entry.conditions) {
			return canReadOrList(ability, entry.subject);
		}
		const instance = subjectInstance(
			entry.subject as AppSubjects & string,
			entry.conditions,
		);
		return canReadOrList(ability, instance);
	});
}
