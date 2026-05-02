import type { ComplianceChecklistType } from "@repo/shared";

export type { ComplianceChecklistType };

export type ChecklistItemPhase = "SUBMISSION" | "PLACEMENT";

export interface RequisitionComplianceChecklistCardItem {
	id: string;
	name: string;
	description?: string;
	checklistItemCount: number;
	linkedRequisitionCount: number;
	lastModified: string;
	/** IDs of compliance items in this checklist (for view/edit) */
	complianceItemIds: string[];
	checklistItems: {
		complianceListItemId: string;
		phase: ChecklistItemPhase;
	}[];
}

export interface ComplianceItemOption {
	id: string;
	name: string;
	description?: string;
	category: string;
	tracksExpiration?: boolean;
}

export type ComplianceItemUsageType = ChecklistItemPhase;

export interface ComplianceItemUsageRow {
	id: string;
	name: string;
	category: string;
	expirationRequired: boolean;
	displayToCandidate: boolean;
	checklistPhase?: ChecklistItemPhase;
}

export function toCardItem(
	checklist: ComplianceChecklistType,
	linkedRequisitionCount = 0,
): RequisitionComplianceChecklistCardItem {
	return {
		id: checklist.id,
		name: checklist.name,
		description: checklist.description ?? undefined,
		checklistItemCount: checklist.items.length,
		linkedRequisitionCount,
		lastModified: new Date(checklist.updatedAt).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}),
		complianceItemIds: checklist.items.map((i) => i.complianceListItemId),
		checklistItems: checklist.items.map((i) => ({
			complianceListItemId: i.complianceListItemId,
			phase: i.phase as ChecklistItemPhase,
		})),
	};
}
