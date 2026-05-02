import {
	ComplianceListItemCategory,
	ComplianceListItemExpirationType,
	ComplianceListItemResponseStyle,
	ExpirationRuleUnit,
} from "@repo/shared";

export const COMPLIANCE_CATEGORY_OPTIONS = [
	{
		value: ComplianceListItemCategory.BACKGROUND_AND_IDENTIFICATION,
		label: "Background and Identification",
	},
	{ value: ComplianceListItemCategory.CERTIFICATIONS, label: "Certifications" },
	{
		value: ComplianceListItemCategory.EMPLOYEE_HEALTH,
		label: "Employee Health",
	},
	{ value: ComplianceListItemCategory.IMMIGRATION, label: "Immigration" },
	{ value: ComplianceListItemCategory.LICENSES, label: "Licenses" },
	{ value: ComplianceListItemCategory.ASSESSMENTS, label: "Assessments" },
	{ value: ComplianceListItemCategory.CLIENT_POLICY, label: "Client Policy" },
	{ value: ComplianceListItemCategory.OTHERS, label: "Others" },
] as const;

export const COMPLIANCE_CATEGORY_LABELS: Record<
	ComplianceListItemCategory,
	string
> = Object.fromEntries(
	COMPLIANCE_CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ComplianceListItemCategory, string>;

export const ALL_COMPLIANCE_CATEGORIES = COMPLIANCE_CATEGORY_OPTIONS.map(
	(o) => o.value,
) as readonly ComplianceListItemCategory[];

export const COMPLIANCE_EXPIRATION_TYPE_OPTIONS = [
	{
		value: ComplianceListItemExpirationType.EXPIRATION_DATE,
		label: "Expiration Date",
	},
	{
		value: ComplianceListItemExpirationType.EXPIRATION_RULE,
		label: "Expiration Rule",
	},
	{
		value: ComplianceListItemExpirationType.NON_EXPIRABLE,
		label: "Non-Expirable",
	},
] as const;

export const COMPLIANCE_EXPIRATION_TYPE_LABELS: Record<
	ComplianceListItemExpirationType,
	string
> = {
	[ComplianceListItemExpirationType.EXPIRATION_DATE]: "Expiration Date",
	[ComplianceListItemExpirationType.EXPIRATION_RULE]: "Expiration Rule",
	[ComplianceListItemExpirationType.NON_EXPIRABLE]: "Non-Expirable",
};

export const COMPLIANCE_RESPONSE_STYLE_OPTIONS = [
	{
		value: ComplianceListItemResponseStyle.PENDING_FILE_UPLOAD,
		label: "Pending File Upload",
	},
	{
		value: ComplianceListItemResponseStyle.INTERNAL_TASK,
		label: "Internal Task",
	},
	{
		value: ComplianceListItemResponseStyle.DOWNLOAD_AND_UPLOAD,
		label: "Download Attachment and Upload",
	},
	{ value: ComplianceListItemResponseStyle.LINK, label: "Link" },
] as const;

export const COMPLIANCE_EXPIRATION_RULE_UNIT_OPTIONS = [
	{ value: ExpirationRuleUnit.DAYS, label: "Days" },
	{ value: ExpirationRuleUnit.MONTHS, label: "Months" },
	{ value: ExpirationRuleUnit.YEARS, label: "Years" },
] as const;
