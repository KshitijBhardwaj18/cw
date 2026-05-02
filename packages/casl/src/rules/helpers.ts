import type { AbilityBuilder } from "@casl/ability";
import type { AppAbility } from "../types/ability";
import { Action } from "../types/actions";

export type Can = AbilityBuilder<AppAbility>["can"];
export type Cannot = AbilityBuilder<AppAbility>["cannot"];

export const CRUD_ACTIONS: Action[] = [
	Action.Create,
	Action.Read,
	Action.List,
	Action.Update,
	Action.Delete,
];

export const CRU_ACTIONS: Action[] = [
	Action.Create,
	Action.Read,
	Action.List,
	Action.Update,
];

export const READ_UPDATE_ACTIONS: Action[] = [
	Action.Read,
	Action.List,
	Action.Update,
];

export const READ_CREATE_ACTIONS: Action[] = [
	Action.Read,
	Action.List,
	Action.Create,
];
