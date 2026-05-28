import {
	CandidateComplianceStatus,
	type CandidateWorkforceType,
} from "@repo/db";
import { isInternalWorkforceType } from "@repo/shared";

export type ComplianceStatusOnUpload = {
	status: CandidateComplianceStatus;
	verifiedById: string | null;
	verifiedAt: Date | null;
};

export function resolveComplianceStatusOnUpload(
	workforceType: CandidateWorkforceType | null | undefined,
	verifierUserId: string,
	now: Date = new Date(),
): ComplianceStatusOnUpload {
	if (isInternalWorkforceType(workforceType)) {
		return {
			status: CandidateComplianceStatus.APPROVED,
			verifiedById: verifierUserId,
			verifiedAt: now,
		};
	}
	return {
		status: CandidateComplianceStatus.PENDING_REVIEW,
		verifiedById: null,
		verifiedAt: null,
	};
}
