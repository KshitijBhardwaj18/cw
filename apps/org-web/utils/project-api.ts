import type { ProjectFormValues } from "@/schemas";
import type { ProjectItem, ProjectRequisitionItem } from "@/types/project";

export type ProjectListRowApi = {
	id: string;
	name: string;
	description: string;
	status: ProjectItem["status"];
	requisitionCount: number;
	updatedAt: string;
};

export type ProjectMetaApi = {
	id: string;
	name: string;
	description: string;
	status: ProjectItem["status"];
	updatedAt: string;
};

export type ProjectStatsApi = {
	requisitionCount: number;
	totalOpenPositions: number;
	activeRequisitions: number;
};

export type ProjectRequisitionsListApi = {
	data: ProjectRequisitionItem[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export function formatProjectUpdatedLabel(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "—";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
	}).format(d);
}

export function projectFormStatusToApi(
	status: ProjectFormValues["status"],
): "ACTIVE" | "INACTIVE" {
	return status === "Inactive" ? "INACTIVE" : "ACTIVE";
}

export function apiListRowToProjectItem(row: ProjectListRowApi): ProjectItem {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		status: row.status,
		requisitionCount: row.requisitionCount,
		updatedAt: formatProjectUpdatedLabel(row.updatedAt),
		linkedRequisitionIds: [],
		requisitions: [],
	};
}
