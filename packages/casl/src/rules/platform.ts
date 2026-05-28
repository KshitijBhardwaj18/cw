import type { User } from "@repo/db";
import { UserRole } from "@repo/shared";
import type { Can, Cannot } from "./helpers";
import { defineCandidateUserRules } from "./roles/candidate-user";
import { defineComplianceManagerRules } from "./roles/compliance-manager";
import { defineGeneralAdminRules } from "./roles/general-admin";
import { defineOperationsManagerRules } from "./roles/operations-manager";
import { defineOrganizationUserRules } from "./roles/organization-user";
import { defineProgramManagerRules } from "./roles/program-manager";
import { defineProgramVendorManagerRules } from "./roles/program-vendor-manager";
import { defineSuperAdminRules } from "./roles/super-admin";
import { defineTechnicalManagerRules } from "./roles/technical-manager";
import { defineAllVendorUserRules } from "./roles/vendor-user";

export function definePlatformRules(can: Can, cannot: Cannot, user: User) {
	switch (user.role) {
		case UserRole.SUPER_ADMIN:
			defineSuperAdminRules(can);
			return;

		case UserRole.CANDIDATE_USER:
			defineCandidateUserRules(can);
			return;

		case UserRole.GENERAL_ADMIN:
			defineGeneralAdminRules(can);
			return;

		case UserRole.ORGANIZATION_USER:
			defineOrganizationUserRules(can, user.subRole);
			return;

		case UserRole.OPERATIONS_MANAGER:
			defineOperationsManagerRules(can);
			return;

		case UserRole.PROGRAM_MANAGER:
			defineProgramManagerRules(can);
			return;

		case UserRole.TECHNICAL_MANAGER:
			defineTechnicalManagerRules(can);
			return;

		case UserRole.PROGRAM_VENDOR_MANAGER:
			defineProgramVendorManagerRules(can, cannot);
			return;

		case UserRole.COMPLIANCE_MANAGER:
			defineComplianceManagerRules(can);
			return;

		case UserRole.VENDOR_USER:
			defineAllVendorUserRules(can, user.subRole);
			return;

		default:
			return;
	}
}
