export enum ComplianceListItemCategory {
	BACKGROUND_AND_IDENTIFICATION = "BACKGROUND_AND_IDENTIFICATION",
	CERTIFICATIONS = "CERTIFICATIONS",
	EMPLOYEE_HEALTH = "EMPLOYEE_HEALTH",
	IMMIGRATION = "IMMIGRATION",
	LICENSES = "LICENSES",
	ASSESSMENTS = "ASSESSMENTS",
	CLIENT_POLICY = "CLIENT_POLICY",
	OTHERS = "OTHERS",
}

export enum ComplianceListItemExpirationType {
	EXPIRATION_DATE = "EXPIRATION_DATE",
	EXPIRATION_RULE = "EXPIRATION_RULE",
	NON_EXPIRABLE = "NON_EXPIRABLE",
}

export enum ComplianceListItemResponseStyle {
	PENDING_FILE_UPLOAD = "PENDING_FILE_UPLOAD",
	INTERNAL_TASK = "INTERNAL_TASK",
	DOWNLOAD_AND_UPLOAD = "DOWNLOAD_AND_UPLOAD",
	LINK = "LINK",
}

export enum ComplianceListItemStatus {
	ACTIVE = "ACTIVE",
	INACTIVE = "INACTIVE",
}

export enum ExpirationRuleUnit {
	DAYS = "DAYS",
	MONTHS = "MONTHS",
	YEARS = "YEARS",
}

export enum ComplianceChecklistItemPhase {
	SUBMISSION = "SUBMISSION",
	PLACEMENT = "PLACEMENT",
}

/**
 * - MISSING: candidate hasn't uploaded yet.
 * - PENDING_REVIEW: uploaded, awaiting reviewer (vendor for external wallet/
 *   submission; vendor or org for placement compliance).
 * - APPROVED: verified by reviewer or auto-approved for internal candidates.
 * - REJECTED: explicitly rejected; rejection reason stored in `notes` on the
 *   row. File is retained so the candidate can see what was rejected.
 * - EXPIRED: expiry date has passed.
 */
export enum CandidateComplianceStatus {
	MISSING = "MISSING",
	PENDING_REVIEW = "PENDING_REVIEW",
	APPROVED = "APPROVED",
	REJECTED = "REJECTED",
	EXPIRED = "EXPIRED",
}
