import {
	OrganizationIndustry,
	OrganizationTimezone,
	OrganizationType,
} from "@repo/db";
import {
	getDeterministicId,
	SAMPLE_PDF_URL,
	SEED_EMAIL_DOMAIN,
	SEED_PREFIX,
} from "../utils";

export const getOrganizationDataset = () => ({
	id: getDeterministicId(`${SEED_PREFIX}org`),
	name: "Test",
	slug: "test",
	email: `contact@${SEED_EMAIL_DOMAIN}`,
	phone: "+15551234567",
	industry: OrganizationIndustry.HEALTHCARE,
	organizationType: OrganizationType.HOSPITAL_NETWORK,
	timeZone: OrganizationTimezone.CENTRAL,
	website: `https://${SEED_EMAIL_DOMAIN}`,
	serviceAgreement: SAMPLE_PDF_URL,
	description:
		"Leading healthcare provider with multiple facilities across the region.",
	agreementRenewalDate: new Date("2025-12-31"),
	isActive: true,
	expectedAnnualSpend: 1000000,
});
