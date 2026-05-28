import { BadRequestException } from "@nestjs/common";
import {
	ComplianceListItemExpirationType,
	computeExpiryFromRule,
	type ExpirationRuleUnit,
} from "@repo/shared";

export type ComplianceExpirationRuleSource = {
	expirationType: `${ComplianceListItemExpirationType}`;
	expirationRuleValue: number | null;
	expirationRuleUnit: `${ExpirationRuleUnit}` | null;
};

export function resolveExpiryForUpload(
	listItem: ComplianceExpirationRuleSource,
	expiryDateRaw: string | undefined,
	issueDateRaw: string | undefined,
): { issueDate: Date | null; expiryDate: Date | null } {
	if (
		listItem.expirationType === ComplianceListItemExpirationType.NON_EXPIRABLE
	) {
		return { issueDate: null, expiryDate: null };
	}

	if (
		listItem.expirationType === ComplianceListItemExpirationType.EXPIRATION_RULE
	) {
		const trimmed = issueDateRaw?.trim();
		if (!trimmed) {
			throw new BadRequestException(
				"Issue date is required for this compliance item",
			);
		}
		const issueDate = new Date(trimmed);
		if (Number.isNaN(issueDate.getTime())) {
			throw new BadRequestException("Enter a valid issue date.");
		}
		const computed = computeExpiryFromRule(
			issueDate,
			listItem.expirationRuleValue,
			listItem.expirationRuleUnit,
		);
		if (!computed) {
			throw new BadRequestException(
				"Compliance item is missing a valid expiration rule",
			);
		}
		return { issueDate, expiryDate: computed };
	}

	const trimmed = expiryDateRaw?.trim();
	if (!trimmed) {
		throw new BadRequestException(
			"Expiration date is required for this compliance item",
		);
	}
	const expiry = new Date(trimmed);
	if (Number.isNaN(expiry.getTime())) {
		throw new BadRequestException("Enter a valid expiration date.");
	}
	return { issueDate: null, expiryDate: expiry };
}
