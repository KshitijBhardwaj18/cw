import { MemberRole } from "@repo/shared";
import type { Can } from "../../helpers";
import { defineOrganizationUserExecutiveRules } from "./executive";
import { defineOrganizationUserHiringManagerRules } from "./hiring-manager";
import { defineOrganizationUserOperationsRules } from "./operations";

export function defineOrganizationUserRules(can: Can, subRole: string | null) {
	switch (subRole) {
		case MemberRole.EXECUTIVE:
			defineOrganizationUserExecutiveRules(can);
			return;
		case MemberRole.HIRING_MANAGER:
			defineOrganizationUserHiringManagerRules(can);
			return;
		case MemberRole.OPERATIONS:
			defineOrganizationUserOperationsRules(can);
			return;
		default:
			return;
	}
}
