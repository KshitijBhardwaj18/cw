import {
	type ComplianceChecklistItemPhase,
	type ComplianceChecklistType,
	DEFAULT_TIMEZONE,
	formatTzShortDate,
	type OrganizationTimezone,
} from "@repo/shared";

export type { ComplianceChecklistType };

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
		phase: ComplianceChecklistItemPhase;
	}[];
}

export interface ComplianceItemOption {
	id: string;
	name: string;
	description?: string;
	category: string;
	tracksExpiration?: boolean;
	displayToCandidate?: boolean;
}

export type ComplianceItemUsageType = ComplianceChecklistItemPhase;

export interface ComplianceItemUsageRow {
	id: string;
	name: string;
	category: string;
	expirationRequired: boolean;
	displayToCandidate: boolean;
	checklistPhase?: ComplianceChecklistItemPhase;
}

export function toCardItem(
	checklist: ComplianceChecklistType,
	linkedRequisitionCount = 0,
	tz: OrganizationTimezone = DEFAULT_TIMEZONE,
): RequisitionComplianceChecklistCardItem {
	return {
		id: checklist.id,
		name: checklist.name,
		description: checklist.description ?? undefined,
		checklistItemCount: checklist.items.length,
		linkedRequisitionCount,
		lastModified: formatTzShortDate(checklist.updatedAt, tz),
		complianceItemIds: checklist.items.map((i) => i.complianceListItemId),
		checklistItems: checklist.items.map((i) => ({
			complianceListItemId: i.complianceListItemId,
			phase: i.phase as ComplianceChecklistItemPhase,
		})),
	};
}
