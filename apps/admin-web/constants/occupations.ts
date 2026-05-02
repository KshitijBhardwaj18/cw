import { OrganizationIndustry } from "@repo/shared";

export const INDUSTRY_OPTIONS = [
	{ value: OrganizationIndustry.HEALTHCARE, label: "Healthcare" },
	{ value: OrganizationIndustry.TECHNOLOGY, label: "Technology" },
	{ value: OrganizationIndustry.FINANCE, label: "Finance" },
	{ value: OrganizationIndustry.MANUFACTURING, label: "Manufacturing" },
	{ value: OrganizationIndustry.RETAIL, label: "Retail" },
	{ value: OrganizationIndustry.OTHER, label: "Other" },
] as const;
