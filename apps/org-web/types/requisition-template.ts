export type RequisitionTemplateStatus = "ACTIVE" | "DRAFT";

export type RequisitionTemplateType =
	| "LONG_TERM_ORDER"
	| "PER_DIEM"
	| "PERMANENT_ROLE"
	| "INTERNAL_FLEX_POOL";

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
