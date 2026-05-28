import type { PrismaQuery } from "@casl/prisma";
import type { AppAbility } from "../types/ability";
import { Action } from "../types/actions";
import type { AppSubjects } from "../types/subjects";
import { subjectInstance } from "../utils/subject-instance";

export const BILLING_TABS = [
	"billing-configuration",
	"invoice-history",
	"rates",
] as const;

export type BillingTab = (typeof BILLING_TABS)[number];

export const BILLING_TAB_CONDITIONS = {
	"billing-configuration": { tab: "billing-configuration" },
	"invoice-history": { tab: "invoice-history" },
	rates: { tab: "rates" },
} as const satisfies Record<BillingTab, PrismaQuery>;

export const BILLING_CONFIG_SECTIONS = [
	"general",
	"invoice-preferences",
	"timekeeping",
	"fee-structure",
	"financial-tables",
] as const;

export type BillingConfigSection = (typeof BILLING_CONFIG_SECTIONS)[number];

export const BILLING_CONFIG_SECTION_CONDITIONS = {
	general: { section: "general" },
	"invoice-preferences": { section: "invoice-preferences" },
	timekeeping: { section: "timekeeping" },
	"fee-structure": { section: "fee-structure" },
	"financial-tables": { section: "financial-tables" },
} as const satisfies Record<BillingConfigSection, PrismaQuery>;

export const BILLING_TAB_ORDER = [...BILLING_TABS] as const;

export const BILLING_TAB_CHECKS = {
	"billing-configuration": {
		subject: "Billing" as AppSubjects,
		conditions: BILLING_TAB_CONDITIONS["billing-configuration"],
	},
	"invoice-history": {
		subject: "Billing" as AppSubjects,
		conditions: BILLING_TAB_CONDITIONS["invoice-history"],
	},
	rates: {
		subject: "Billing" as AppSubjects,
		conditions: BILLING_TAB_CONDITIONS.rates,
	},
} as const;

function canReadOrListBillingTab(
	ability: AppAbility,
	tab: BillingTab,
): boolean {
	const instance = subjectInstance(
		"Billing",
		BILLING_TAB_CONDITIONS[tab] as Record<string, unknown>,
	);
	return (
		ability.can(Action.Read, instance) || ability.can(Action.List, instance)
	);
}

export function canAccessBillingPage(ability: AppAbility): boolean {
	return BILLING_TABS.some((tab) => canReadOrListBillingTab(ability, tab));
}

export function canReadBillingConfigSection(
	ability: AppAbility,
	section: BillingConfigSection,
): boolean {
	const instance = subjectInstance(
		"BillingConfig",
		BILLING_CONFIG_SECTION_CONDITIONS[section] as Record<string, unknown>,
	);
	return (
		ability.can(Action.Read, instance) || ability.can(Action.List, instance)
	);
}

export function canUpdateBillingConfigSection(
	ability: AppAbility,
	section: BillingConfigSection,
): boolean {
	const instance = subjectInstance(
		"BillingConfig",
		BILLING_CONFIG_SECTION_CONDITIONS[section] as Record<string, unknown>,
	);
	return ability.can(Action.Update, instance);
}
