import {
	CandidateComplianceStatus,
	type ComplianceListItemExpirationType,
	ComplianceListItemResponseStyle,
	type ExpirationRuleUnit,
	Prisma,
} from "@repo/db";
import { deriveStoredComplianceStatus } from "./derive-stored-compliance-status";

export const ACCEPTANCE_CRITERIA_COMPLIANCE_LIST_ITEM_SELECT = {
	id: true,
	name: true,
	displayToCandidate: true,
	responseStyle: true,
	file: true,
	instructionalNotes: true,
	expirationType: true,
	expirationRuleValue: true,
	expirationRuleUnit: true,
} as const satisfies Prisma.ComplianceListItemSelect;

export const ACCEPTANCE_CRITERIA_SELECT = {
	complianceListItemId: true,
	complianceListItem: {
		select: ACCEPTANCE_CRITERIA_COMPLIANCE_LIST_ITEM_SELECT,
	},
} as const satisfies Prisma.RequisitionAcceptanceCriterionSelect;

export const CANDIDATE_COMPLIANCE_FOR_CRITERION_SELECT = {
	complianceListItemId: true,
	status: true,
	documentUrl: true,
	documentFileName: true,
	expiryDate: true,
	notes: true,
} as const satisfies Prisma.CandidateComplianceSelect;

export type AcceptanceCriterionInput = {
	complianceListItem: {
		id: string;
		name: string;
		displayToCandidate: boolean;
		responseStyle: `${ComplianceListItemResponseStyle}`;
		file: string | null;
		instructionalNotes: string | null;
		expirationType: `${ComplianceListItemExpirationType}`;
		expirationRuleValue: number | null;
		expirationRuleUnit: `${ExpirationRuleUnit}` | null;
	};
};

export type AcceptanceCriterionDoc = {
	status: CandidateComplianceStatus;
	documentUrl: string | null;
	documentFileName: string | null;
	expiryDate: Date | null;
	notes: string | null;
};

export type AcceptanceCriterionViewerScope = "candidate" | "vendor";

export type AcceptanceCriterionItem = {
	id: string;
	name: string;
	responseStyle: `${ComplianceListItemResponseStyle}`;
	status: `${CandidateComplianceStatus}`;
	satisfied: boolean;
	rejectionReason: string | null;
	documentName: string | null;
	expirationDate: string | null;
	link: string | null;
	instructionalNotes: string | null;
	expirationType: `${ComplianceListItemExpirationType}`;
	expirationRuleValue: number | null;
	expirationRuleUnit: `${ExpirationRuleUnit}` | null;
};

export function deriveAcceptanceCriterionItem(
	criterion: AcceptanceCriterionInput,
	doc: AcceptanceCriterionDoc | undefined,
	opts: { now: Date; viewerScope: AcceptanceCriterionViewerScope },
): AcceptanceCriterionItem {
	const li = criterion.complianceListItem;
	const status = deriveStoredComplianceStatus(doc ?? null, opts.now);
	const hasDoc = !!doc?.documentUrl?.trim();
	const isLink = li.responseStyle === ComplianceListItemResponseStyle.LINK;
	const isApproved = status === CandidateComplianceStatus.APPROVED;
	const isPending = status === CandidateComplianceStatus.PENDING_REVIEW;
	const isExpired = status === CandidateComplianceStatus.EXPIRED;
	const isRejected = status === CandidateComplianceStatus.REJECTED;

	const satisfied =
		opts.viewerScope === "candidate"
			? (hasDoc || isLink) &&
				!isExpired &&
				!isRejected &&
				(isApproved || isPending)
			: (hasDoc || isLink) && !isExpired && !isRejected && isApproved;

	return {
		id: li.id,
		name: li.name,
		responseStyle: li.responseStyle,
		status,
		satisfied,
		rejectionReason: isRejected ? (doc?.notes?.trim() ?? null) : null,
		documentName: doc?.documentFileName ?? null,
		expirationDate: doc?.expiryDate?.toISOString().slice(0, 10) ?? null,
		link: li.file,
		instructionalNotes: li.instructionalNotes,
		expirationType: li.expirationType,
		expirationRuleValue: li.expirationRuleValue,
		expirationRuleUnit: li.expirationRuleUnit,
	};
}
