import { CandidateComplianceStatus } from "@repo/db";

export function deriveStoredComplianceStatus(
	cc: {
		status: CandidateComplianceStatus;
		expiryDate: Date | null;
	} | null,
	now: Date,
): `${CandidateComplianceStatus}` {
	if (!cc) return CandidateComplianceStatus.MISSING;
	if (cc.expiryDate && cc.expiryDate < now) {
		return CandidateComplianceStatus.EXPIRED;
	}
	return cc.status;
}
