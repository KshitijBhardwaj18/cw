"use client";

import {
	Action,
	BILLING_CONFIG_SECTIONS,
	BILLING_TAB_CHECKS,
	BILLING_TAB_ORDER,
	type BillingConfigSection,
	type BillingTab,
	canReadBillingConfigSection,
	canUpdateBillingConfigSection,
	filterReadableTabs,
	subjectInstance,
} from "@repo/casl";
import { useMemo } from "react";
import { useAuth } from "@/contexts";

export function useBillingAbilities() {
	const { ability } = useAuth();

	const allowedTabs = useMemo(
		() => filterReadableTabs(ability, BILLING_TAB_ORDER, BILLING_TAB_CHECKS),
		[ability],
	);

	const canAccessBilling = allowedTabs.length > 0;

	const canReadConfigSection = (section: BillingConfigSection) =>
		canReadBillingConfigSection(ability, section);

	const canUpdateConfigSection = (section: BillingConfigSection) =>
		canUpdateBillingConfigSection(ability, section);

	const visibleConfigSections = useMemo(
		() =>
			BILLING_CONFIG_SECTIONS.filter((section) =>
				canReadBillingConfigSection(ability, section),
			),
		[ability],
	);

	const canUpdateBillingConfig = ability.can(Action.Update, "BillingConfig");

	const canUpdateTab = (tab: BillingTab) =>
		ability.can(Action.Update, subjectInstance("Billing", { tab }));

	const canCreatePayCode = ability.can(Action.Create, "OrganizationPayCode");
	const canUpdatePayCode = ability.can(Action.Update, "OrganizationPayCode");
	const canDeletePayCode = ability.can(Action.Delete, "OrganizationPayCode");

	const canUpdateWorkforceRate = ability.can(
		Action.Update,
		"OrganizationWorkforceBillingRate",
	);

	const canUpdateInvoice = ability.can(Action.Update, "Invoice");
	const canCreateInvoice = ability.can(Action.Create, "Invoice");

	return {
		allowedTabs,
		canAccessBilling,
		visibleConfigSections,
		canReadConfigSection,
		canUpdateConfigSection,
		canUpdateBillingConfig,
		canUpdateTab,
		canCreatePayCode,
		canUpdatePayCode,
		canDeletePayCode,
		canUpdateWorkforceRate,
		canUpdateInvoice,
		canCreateInvoice,
		canReadInvoiceHistory: allowedTabs.includes("invoice-history"),
		canReadRatesTab: allowedTabs.includes("rates"),
		canReadBillingConfigurationTab: allowedTabs.includes(
			"billing-configuration",
		),
	};
}
