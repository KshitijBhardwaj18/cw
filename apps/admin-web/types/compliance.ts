import type { ComplianceResponseType } from "@repo/shared";

export type ComplianceTableRowType = Pick<
	ComplianceResponseType,
	"id" | "name" | "expirationType" | "displayToCandidate" | "status"
>;

export type ComplianceColumnsCallbacks = {
	onEdit?: (row: ComplianceTableRowType) => void;
	onDelete?: (row: ComplianceTableRowType) => void;
};
