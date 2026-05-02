import { ApiClient } from "@/lib/api-client";
import type { ProjectDetailRequisitionStatusFilter } from "@/types/project";
import type {
	ProjectListRowApi,
	ProjectMetaApi,
	ProjectRequisitionsListApi,
	ProjectStatsApi,
} from "@/utils/project-api";

const DEFAULT_REQUISITIONS_LIMIT = 20;

const BASE = "/api/org/projects";

export type ProjectsListParams = {
	search?: string;
	/** Prisma `ProjectStatus`: ACTIVE | INACTIVE */
	projectStatus?: "ACTIVE" | "INACTIVE";
	page?: number;
	limit?: number;
};

export type ProjectsListResponse = {
	data: ProjectListRowApi[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type ProjectRequisitionsListParams = {
	search?: string;
	requisitionStatus?: Exclude<ProjectDetailRequisitionStatusFilter, "all">;
	page: number;
	limit?: number;
};

export function buildProjectRequisitionsRequestParams(
	params: ProjectRequisitionsListParams,
): Record<string, string | number> {
	const limit = params.limit ?? DEFAULT_REQUISITIONS_LIMIT;
	const q: Record<string, string | number> = {
		page: params.page,
		limit,
	};
	const s = params.search?.trim();
	if (s) q.search = s;
	if (params.requisitionStatus) {
		q.requisitionStatus = params.requisitionStatus;
	}
	return q;
}

export type CreateProjectPayload = {
	name: string;
	description?: string;
	status: "ACTIVE" | "INACTIVE";
};

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export class ProjectsService {
	static async list(params: ProjectsListParams = {}) {
		return ApiClient.get<ProjectsListResponse>(BASE, params);
	}

	static async getMeta(projectId: string) {
		return ApiClient.get<ProjectMetaApi>(`${BASE}/${projectId}`);
	}

	static async getStats(projectId: string) {
		return ApiClient.get<ProjectStatsApi>(`${BASE}/${projectId}/stats`);
	}

	static async listRequisitions(
		projectId: string,
		params: ProjectRequisitionsListParams,
	) {
		return ApiClient.get<ProjectRequisitionsListApi>(
			`${BASE}/${projectId}/requisitions`,
			buildProjectRequisitionsRequestParams(params),
		);
	}

	static async create(payload: CreateProjectPayload) {
		return ApiClient.post<ProjectListRowApi>(BASE, payload);
	}

	static async update(projectId: string, payload: UpdateProjectPayload) {
		return ApiClient.patch<ProjectListRowApi>(`${BASE}/${projectId}`, payload);
	}

	static async delete(projectId: string) {
		await ApiClient.delete(`${BASE}/${projectId}`);
	}

	static async addRequisitions(projectId: string, requisitionIds: string[]) {
		await ApiClient.post<void>(`${BASE}/${projectId}/requisitions`, {
			requisitionIds,
		});
	}

	static async removeRequisition(projectId: string, requisitionId: string) {
		await ApiClient.delete<void>(
			`${BASE}/${projectId}/requisitions/${requisitionId}`,
		);
	}
}
