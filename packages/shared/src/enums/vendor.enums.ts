import { OrganizationIndustry } from "./occupation.enum";

export const CertifiedBusinessClassification = {
	MINORITY_OWNED_BUSINESS: "MINORITY_OWNED_BUSINESS",
	WOMEN_OWNED_BUSINESS: "WOMEN_OWNED_BUSINESS",
	SMALL_BUSINESS: "SMALL_BUSINESS",
	VETERAN_OWNED_BUSINESS: "VETERAN_OWNED_BUSINESS",
	DISABLED_VETERAN_OWNED_BUSINESS: "DISABLED_VETERAN_OWNED_BUSINESS",
} as const;
export type CertifiedBusinessClassification =
	(typeof CertifiedBusinessClassification)[keyof typeof CertifiedBusinessClassification];

export const ORGANIZATION_INDUSTRY_OPTIONS = [
	{ value: OrganizationIndustry.HEALTHCARE, label: "Healthcare" },
	{ value: OrganizationIndustry.TECHNOLOGY, label: "Technology" },
	{ value: OrganizationIndustry.FINANCE, label: "Finance" },
	{ value: OrganizationIndustry.MANUFACTURING, label: "Manufacturing" },
	{ value: OrganizationIndustry.RETAIL, label: "Retail" },
	{ value: OrganizationIndustry.OTHER, label: "Other" },
] as const;

export const CERTIFIED_BUSINESS_CLASSIFICATION_OPTIONS = [
	{
		value: CertifiedBusinessClassification.MINORITY_OWNED_BUSINESS,
		label: "Certified Minority Owned Business",
	},
	{
		value: CertifiedBusinessClassification.WOMEN_OWNED_BUSINESS,
		label: "Certified Women Owned Business",
	},
	{
		value: CertifiedBusinessClassification.SMALL_BUSINESS,
		label: "Certified Small Business",
	},
	{
		value: CertifiedBusinessClassification.VETERAN_OWNED_BUSINESS,
		label: "Certified Veteran Owned Business",
	},
	{
		value: CertifiedBusinessClassification.DISABLED_VETERAN_OWNED_BUSINESS,
		label: "Certified Disabled Veteran Owned Business",
	},
] as const;
