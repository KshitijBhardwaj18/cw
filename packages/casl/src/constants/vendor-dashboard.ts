import type { PrismaQuery } from "@casl/prisma";

/** Sections / routes under the real `Dashboard` subject for vendor portal CASL checks. */
export const VENDOR_DASHBOARD_TABS = ["home", "financialOverview"] as const;

export type VendorDashboardTab = (typeof VENDOR_DASHBOARD_TABS)[number];

export const VENDOR_DASHBOARD_TAB_CONDITIONS = {
	/** Vendor portal landing dashboard (non-financial-overview widgets). */
	home: { type: "VENDOR_PORTAL_HOME" },
	financialOverview: { type: "FINANCIAL_OVERVIEW" },
} as const satisfies Record<VendorDashboardTab, PrismaQuery>;
