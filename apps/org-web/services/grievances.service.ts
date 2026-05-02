import type { PagePaginatedResponse } from "@repo/shared";
import type { GrievanceStatus, GrievanceType } from "@/constants/grievances";
import { ApiClient } from "@/lib/api-client";

export type GrievanceListQuery = {
	search?: string;
	type?: GrievanceType;
	status?: GrievanceStatus;
	page?: number;
	limit?: number;
};

export type CreateGrievancePayload = {
	type: GrievanceType;
	candidateId: string;
	placementId?: string;
	description: string;
};

export type CreateGrievanceTaskPayload = {
	category: string;
	assignedToUserId: string;
	description: string;
};

export type GrievanceListApiRow = {
	id: string;
	grievanceNumber: string;
	type: GrievanceType;
	candidateId: string;
	workerName: string;
	placementId: string | null;
	placementLabel: string | null;
	description: string;
	status: GrievanceStatus;
	createdAt: string;
};

export type GrievanceCounts = {
	total: number;
	open: number;
	inProgress: number;
	resolved: number;
};

export type GrievanceLogOptions = {
	candidates: { id: string; name: string }[];
	placements: { id: string; candidateId: string; label: string }[];
};

export type GrievanceDetail = {
	id: string;
	grievanceNumber: string;
	type: GrievanceType;
	status: GrievanceStatus;
	description: string;
	candidateId: string;
	workerName: string;
	candidateRoleLabel: string;
	placementId: string | null;
	placementLabel: string | null;
	placementHospitalName: string | null;
	placementNumericId: string | null;
	createdAt: string;
	tasks: Array<{
		id: string;
		category: string;
		description: string;
		status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
		assignedToUserId: string;
		assigneeName: string;
		completedAt: string | null;
		createdAt: string;
	}>;
};

const BASE = "/api/org/grievances";

export class GrievancesService {
	static async getLogOptions(): Promise<GrievanceLogOptions> {
		return ApiClient.get<GrievanceLogOptions>(`${BASE}/log-options`);
	}

	static async getCounts(): Promise<GrievanceCounts> {
		return ApiClient.get<GrievanceCounts>(`${BASE}/counts`);
	}

	static async list(
		query: GrievanceListQuery,
	): Promise<PagePaginatedResponse<GrievanceListApiRow>> {
		return ApiClient.get<PagePaginatedResponse<GrievanceListApiRow>>(
			BASE,
			query as Record<string, unknown>,
		);
	}

	static async getById(grievanceId: string): Promise<GrievanceDetail> {
		return ApiClient.get<GrievanceDetail>(`${BASE}/${grievanceId}`);
	}

	static async create(body: CreateGrievancePayload): Promise<{ id: string }> {
		return ApiClient.post<{ id: string }>(BASE, body);
	}

	static async createTask(
		grievanceId: string,
		body: CreateGrievanceTaskPayload,
	): Promise<GrievanceDetail> {
		return ApiClient.post<GrievanceDetail>(
			`${BASE}/${grievanceId}/tasks`,
			body,
		);
	}

	static async updateTask(
		grievanceId: string,
		taskId: string,
		body: { status: "PENDING" | "IN_PROGRESS" | "COMPLETED" },
	): Promise<GrievanceDetail> {
		return ApiClient.patch<GrievanceDetail>(
			`${BASE}/${grievanceId}/tasks/${taskId}`,
			body,
		);
	}
}
