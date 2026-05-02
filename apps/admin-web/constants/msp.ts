import type { MspLinkedOrgWithOrganization } from "@repo/shared";

export const MSP_INDUSTRY_OPTIONS = [
	{ value: "HEALTHCARE", label: "Healthcare" },
	{ value: "TECHNOLOGY", label: "Technology" },
	{ value: "FINANCE", label: "Finance" },
	{ value: "MANUFACTURING", label: "Manufacturing" },
	{ value: "RETAIL", label: "Retail" },
	{ value: "OTHER", label: "Other" },
] as const;

export const MSP_ORGANIZATION_TYPE_OPTIONS = [
	{
		value: "ORGANIZATION_STAFFING_OFFICE",
		label: "Organization Staffing Office",
	},
	{ value: "CORPORATE_OFFICE", label: "Corporate Office" },
	{ value: "BRANCH_OFFICE", label: "Branch Office" },
	{ value: "REMOTE_OFFICE", label: "Remote Office" },
] as const;

export const MOCK_MSP_FINANCIAL_SUMMARY = {
	totalPortfolioValue: 7400000,
	totalExpectedMspRevenue: 387500,
	totalExpectedSaasRevenue: 140750,
};

export const MOCK_MSP_LINKED_ORGANIZATIONS = [
	{
		id: "1",
		mspId: "msp-1",
		organizationId: "org-1",
		organization: { name: "Acme Corp" },
		mspFeePercentage: 5,
		saasFeePercentage: 2,
		startDate: new Date("2024-01-01"),
		renewalDate: new Date("2025-01-01"),
		createdAt: new Date(),
		updatedAt: new Date(),
		addendumAgreement: "Master Service Agreement",
		possibleCancellationDate: null,
	},
	{
		id: "2",
		mspId: "msp-1",
		organizationId: "org-2",
		organization: { name: "Globex Corporation" },
		mspFeePercentage: 4.5,
		saasFeePercentage: 1.5,
		startDate: new Date("2024-02-15"),
		renewalDate: new Date("2025-02-15"),
		createdAt: new Date(),
		updatedAt: new Date(),
		addendumAgreement: "Vendor Service Agreement",
		possibleCancellationDate: null,
	},
] as unknown as MspLinkedOrgWithOrganization[];
