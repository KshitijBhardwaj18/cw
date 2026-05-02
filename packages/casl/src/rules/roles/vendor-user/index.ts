import { VendorUserRole } from "@repo/shared";
import type { Can } from "../../helpers";
import { defineVendorManagerRules } from "./vendor-manager";
import { defineVendorUserRules } from "./vendor-user";
import { defineVendorViewOnlyRules } from "./vendor-view-only";

/** Missing or unknown `subRole` defaults to standard vendor user rules (legacy DB rows). */
export function defineAllVendorUserRules(can: Can, subRole: string | null) {
	const normalized = subRole?.trim() || null;

	switch (normalized) {
		case VendorUserRole.VENDOR_MANAGER:
			defineVendorManagerRules(can);
			return;
		case VendorUserRole.VENDOR_VIEW_ONLY:
			defineVendorViewOnlyRules(can);
			return;
		case VendorUserRole.VENDOR_USER:
			defineVendorUserRules(can);
			return;
		default:
			defineVendorUserRules(can);
	}
}
