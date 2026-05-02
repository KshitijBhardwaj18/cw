import { Action } from "../../../types/actions";
import type { Can } from "../../helpers";

export function defineSuperAdminRules(can: Can) {
	can(Action.Manage, "all");
}
