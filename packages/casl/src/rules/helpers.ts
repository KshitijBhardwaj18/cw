import type { AbilityBuilder } from "@casl/ability";
import type { AppAbility } from "../types/ability";
import { Action } from "../types/actions";

export type Can = AbilityBuilder<AppAbility>["can"];
export type Cannot = AbilityBuilder<AppAbility>["cannot"];

export const CREATE_DELETE_ACTIONS: Action[] = [Action.Create, Action.Delete];

export const CREATE_READ_LIST_UPDATE_DELETE_ACTIONS: Action[] = [
	Action.Create,
	Action.Read,
	Action.List,
	Action.Update,
	Action.Delete,
];

export const CREATE_READ_LIST_UPDATE_ACTIONS: Action[] = [
	Action.Create,
	Action.Read,
	Action.List,
	Action.Update,
];

export const CREATE_UPDATE_DELETE_ACTIONS: Action[] = [
	Action.Create,
	Action.Update,
	Action.Delete,
];

export const CREATE_UPDATE_DELETE_ASSIGN_ACTIONS: Action[] = [
	Action.Create,
	Action.Update,
	Action.Delete,
	Action.Assign,
];

export const CREATE_ACTIONS: Action[] = [Action.Create];

export const READ_ACTIONS: Action[] = [Action.Read];

export const READ_LIST_ACTIONS: Action[] = [Action.Read, Action.List];

export const READ_LIST_CREATE_ACTIONS: Action[] = [
	Action.Read,
	Action.List,
	Action.Create,
];

export const READ_LIST_DELETE_ACTIONS: Action[] = [
	Action.Read,
	Action.List,
	Action.Delete,
];

export const READ_LIST_UPDATE_CREATE_ACTIONS: Action[] = [
	Action.Read,
	Action.List,
	Action.Update,
	Action.Create,
];

export const READ_LIST_UPDATE_DELETE_ACTIONS: Action[] = [
	Action.Read,
	Action.List,
	Action.Update,
	Action.Delete,
];

export const READ_LIST_UPDATE_ACTIONS: Action[] = [
	Action.Read,
	Action.List,
	Action.Update,
];

export const UPDATE_ACTIONS: Action[] = [Action.Update];
