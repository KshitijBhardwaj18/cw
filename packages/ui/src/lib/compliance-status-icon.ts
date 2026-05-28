import { CandidateComplianceStatus } from "@repo/shared";
import {
	AlertTriangle,
	Check,
	CircleX,
	Clock,
	type LucideIcon,
} from "lucide-react";

export const CANDIDATE_COMPLIANCE_STATUS_ICON: Record<
	CandidateComplianceStatus,
	LucideIcon
> = {
	[CandidateComplianceStatus.APPROVED]: Check,
	[CandidateComplianceStatus.PENDING_REVIEW]: Clock,
	[CandidateComplianceStatus.MISSING]: AlertTriangle,
	[CandidateComplianceStatus.REJECTED]: CircleX,
	[CandidateComplianceStatus.EXPIRED]: AlertTriangle,
};

export function getCandidateComplianceStatusIcon(
	status: CandidateComplianceStatus | `${CandidateComplianceStatus}` | string,
): LucideIcon {
	return (
		CANDIDATE_COMPLIANCE_STATUS_ICON[status as CandidateComplianceStatus] ??
		AlertTriangle
	);
}

export const CANDIDATE_COMPLIANCE_STATUS_ICON_COLOR: Record<
	CandidateComplianceStatus,
	string
> = {
	[CandidateComplianceStatus.APPROVED]: "text-emerald-600",
	[CandidateComplianceStatus.PENDING_REVIEW]: "text-sky-600",
	[CandidateComplianceStatus.MISSING]: "text-amber-600",
	[CandidateComplianceStatus.REJECTED]: "text-red-600",
	[CandidateComplianceStatus.EXPIRED]: "text-amber-600",
};

export function getCandidateComplianceStatusIconColor(
	status: CandidateComplianceStatus | `${CandidateComplianceStatus}` | string,
): string {
	return (
		CANDIDATE_COMPLIANCE_STATUS_ICON_COLOR[
			status as CandidateComplianceStatus
		] ?? "text-muted-foreground"
	);
}
