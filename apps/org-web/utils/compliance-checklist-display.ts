import type { ComplianceChecklistType } from "@repo/shared";
import type { ComplianceItemOption } from "@/types/requisition-compliance-checklist";

export function complianceChecklistToItemOptions(
	checklist: ComplianceChecklistType | undefined,
): ComplianceItemOption[] {
	if (!checklist?.items?.length) return [];
	return checklist.items.map((row) => ({
		id: row.complianceListItem.id,
		name: row.complianceListItem.name,
		category: row.complianceListItem.category,
		tracksExpiration: row.complianceListItem.expirationType !== "NON_EXPIRABLE",
		displayToCandidate: row.complianceListItem.displayToCandidate,
	}));
}
