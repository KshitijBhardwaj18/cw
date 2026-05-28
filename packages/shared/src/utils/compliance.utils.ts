import {
	CandidateComplianceStatus,
	ComplianceListItemCategory,
	ExpirationRuleUnit,
} from "../enums/compliance.enum";

type ExpirationRuleUnitValue = `${ExpirationRuleUnit}`;

export function computeExpiryFromRule(
	issueDate: Date | string,
	value: number | null | undefined,
	unit: ExpirationRuleUnitValue | null | undefined,
): Date | null {
	if (!issueDate || !value || value <= 0 || !unit) return null;
	const d =
		typeof issueDate === "string" ? new Date(issueDate) : new Date(issueDate);
	if (Number.isNaN(d.getTime())) return null;
	switch (unit) {
		case ExpirationRuleUnit.DAYS:
			d.setUTCDate(d.getUTCDate() + value);
			break;
		case ExpirationRuleUnit.MONTHS:
			d.setUTCMonth(d.getUTCMonth() + value);
			break;
		case ExpirationRuleUnit.YEARS:
			d.setUTCFullYear(d.getUTCFullYear() + value);
			break;
	}
	return d;
}

export function formatExpiryFromRule(
	issueDate: Date | string,
	value: number | null | undefined,
	unit: ExpirationRuleUnitValue | null | undefined,
): string | null {
	const d = computeExpiryFromRule(issueDate, value, unit);
	if (!d) return null;
	return d.toISOString().split("T")[0] ?? null;
}

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

export const CANDIDATE_COMPLIANCE_STATUS_LABEL: Record<
	CandidateComplianceStatus,
	string
> = {
	[CandidateComplianceStatus.MISSING]: "Pending Upload",
	[CandidateComplianceStatus.PENDING_REVIEW]: "Pending Review",
	[CandidateComplianceStatus.APPROVED]: "Approved",
	[CandidateComplianceStatus.REJECTED]: "Rejected",
	[CandidateComplianceStatus.EXPIRED]: "Expired",
};

export function getCandidateComplianceStatusLabel(
	status: CandidateComplianceStatus | `${CandidateComplianceStatus}` | string,
): string {
	return (
		CANDIDATE_COMPLIANCE_STATUS_LABEL[status as CandidateComplianceStatus] ??
		String(status)
	);
}

/**
 * - APPROVED → success (green)
 * - PENDING_REVIEW → info (blue) — uploaded, neutral awaiting state
 * - MISSING → secondary (gray) — candidate hasn't acted yet
 * - REJECTED → error (red) — explicit problem, needs candidate action
 * - EXPIRED → warning (amber) — time-based, needs replacement
 */
export type CandidateComplianceStatusBadgeVariant =
	| "success"
	| "info"
	| "secondary"
	| "error"
	| "warning";

export const CANDIDATE_COMPLIANCE_STATUS_VARIANT: Record<
	CandidateComplianceStatus,
	CandidateComplianceStatusBadgeVariant
> = {
	[CandidateComplianceStatus.APPROVED]: "success",
	[CandidateComplianceStatus.PENDING_REVIEW]: "info",
	[CandidateComplianceStatus.MISSING]: "secondary",
	[CandidateComplianceStatus.REJECTED]: "error",
	[CandidateComplianceStatus.EXPIRED]: "warning",
};

export function getCandidateComplianceStatusVariant(
	status: CandidateComplianceStatus | `${CandidateComplianceStatus}` | string,
): CandidateComplianceStatusBadgeVariant {
	return (
		CANDIDATE_COMPLIANCE_STATUS_VARIANT[status as CandidateComplianceStatus] ??
		"secondary"
	);
}
