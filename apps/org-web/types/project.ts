export type ProjectStatus = "Active" | "Inactive";

export const PROJECT_REQUISITION_STATUS_VALUES = [
	"DRAFT",
	"ACTIVE",
	"INACTIVE",
	"PENDING_APPROVAL",
	"APPROVED",
	"PUBLISHED",
	"ON_HOLD",
	"FILLED",
	"CANCELLED",
	"CLOSED",
] as const;

export type ProjectRequisitionStatus =
	(typeof PROJECT_REQUISITION_STATUS_VALUES)[number];

export type ProjectDetailRequisitionStatusFilter =
	| "all"
	| ProjectRequisitionStatus;

export interface ProjectRequisitionItem {
	id: string;
	title: string;
	occupation: string;
	location: string;
	rateLabel: string;
	openPositions: number;
	specialty: string;
	startDateLabel: string;
	status: ProjectRequisitionStatus;
}

export interface ProjectItem {
	id: string;
	name: string;
	description: string;
	status: ProjectStatus;
	requisitionCount: number;
	updatedAt: string;
	linkedRequisitionIds: string[];
	requisitions: ProjectRequisitionItem[];
}
