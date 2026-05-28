import type { RequisitionType } from "@repo/shared";

export type RequisitionTemplateStatus = "ACTIVE" | "DRAFT";

/** @deprecated Use `RequisitionType` from `@repo/shared` directly. */
export type RequisitionTemplateType = RequisitionType;

export interface RequisitionTemplateCardItem {
	id: string;
	title: string;
	occupation: string;
	specialty: string;
	status: RequisitionTemplateStatus;
	complianceItemCount: number;
	lastUpdated: string;
	type: RequisitionTemplateType;
	templateName: string;
}
