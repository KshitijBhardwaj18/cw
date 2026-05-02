import { ComplianceListItemCategory } from "../enums/compliance.enum";

export const COMPLIANCE_LIST_ITEM_CATEGORY_LABEL: Record<
	ComplianceListItemCategory,
	string
> = {
	[ComplianceListItemCategory.BACKGROUND_AND_IDENTIFICATION]:
		"Background & Identification",
	[ComplianceListItemCategory.CERTIFICATIONS]: "Certifications",
	[ComplianceListItemCategory.EMPLOYEE_HEALTH]: "Employee Health",
	[ComplianceListItemCategory.IMMIGRATION]: "Immigration",
	[ComplianceListItemCategory.LICENSES]: "Licenses",
	[ComplianceListItemCategory.ASSESSMENTS]: "Assessments",
	[ComplianceListItemCategory.CLIENT_POLICY]: "Client Policy",
	[ComplianceListItemCategory.OTHERS]: "Others",
};

export function getComplianceListItemCategoryLabel(
	key: ComplianceListItemCategory | string,
): string {
	return (
		COMPLIANCE_LIST_ITEM_CATEGORY_LABEL[key as ComplianceListItemCategory] ??
		String(key)
	);
}

export const COMPLIANCE_LIST_ITEM_CATEGORIES = Object.values(
	ComplianceListItemCategory,
) as ComplianceListItemCategory[];

export function complianceCategoryToSlug(
	category: ComplianceListItemCategory,
): string {
	return category.toLowerCase().replace(/_/g, "-");
}

const SLUG_TO_CATEGORY = Object.fromEntries(
	(
		Object.values(ComplianceListItemCategory) as ComplianceListItemCategory[]
	).map((c) => [c.toLowerCase().replace(/_/g, "-"), c]),
) as Record<string, ComplianceListItemCategory>;

export function complianceSlugToCategory(
	slug: string,
): ComplianceListItemCategory | null {
	const normalized = slug.toLowerCase().replace(/_/g, "-");
	return SLUG_TO_CATEGORY[normalized] ?? null;
}
