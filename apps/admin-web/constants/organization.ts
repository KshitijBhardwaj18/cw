import {
	DepartmentType,
	LocationType,
	OrganizationIndustry,
	OrganizationType,
	OrganizationVendorStatus,
} from "@repo/shared";

export const DEPARTMENT_TYPE_OPTIONS = [
	{ value: DepartmentType.CLINICAL, label: "Clinical" },
	{ value: DepartmentType.NON_CLINICAL, label: "Non-Clinical" },
	{ value: DepartmentType.ADMINISTRATIVE, label: "Administrative" },
] as const;

export const ORGANIZATION_INDUSTRY_OPTIONS = [
	{ value: OrganizationIndustry.HEALTHCARE, label: "Healthcare" },
	{ value: OrganizationIndustry.TECHNOLOGY, label: "Technology" },
	{ value: OrganizationIndustry.FINANCE, label: "Finance" },
	{ value: OrganizationIndustry.MANUFACTURING, label: "Manufacturing" },
	{ value: OrganizationIndustry.RETAIL, label: "Retail" },
	{ value: OrganizationIndustry.OTHER, label: "Other" },
] as const;

export const ORGANIZATION_TYPE_OPTIONS = [
	{ value: OrganizationType.HOSPITAL_NETWORK, label: "Hospital Network" },
	{ value: OrganizationType.CLINIC, label: "Clinic" },
	{ value: OrganizationType.CORPORATE, label: "Corporate" },
	{ value: OrganizationType.NON_PROFIT, label: "Non-Profit" },
	{ value: OrganizationType.GOVERNMENT, label: "Government" },
] as const;

export const LOCATION_TYPE_OPTIONS = [
	{ value: LocationType.HEADQUARTERS, label: "Headquarters" },
	{ value: LocationType.BRANCH, label: "Branch" },
	{ value: LocationType.SATELLITE, label: "Satellite" },
	{ value: LocationType.REMOTE, label: "Remote" },
] as const;

export const ORGANIZATION_VENDOR_STATUS_OPTIONS = [
	{ value: OrganizationVendorStatus.PENDING, label: "Pending" },
	{ value: OrganizationVendorStatus.ACTIVE, label: "Active" },
] as const;
