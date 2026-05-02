export type ProjectStatus = "Active" | "Inactive";

export type ProjectDetailRequisitionStatusFilter =
	| "all"
	| ProjectRequisitionItem["status"];

export interface ProjectRequisitionItem {
	id: string;
	title: string;
	occupation: string;
	location: string;
	rateLabel: string;
	openPositions: number;
	specialty: string;
	startDateLabel: string;
	status: "Open" | "Closed" | "On Hold";
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
