import type { Metric } from "@repo/db";
import { ApiClient } from "@/lib/api-client";

export type OrganizationMetricRow = {
	id: string;
	metricId: string;
	goal: number;
	isActive: boolean;
	updatedAt: string;
};

export type OrganizationMetricCatalogItem = {
	metric: Metric;
	organizationMetric: OrganizationMetricRow | null;
	latestSnapshot: {
		id: string;
		periodType: "DAILY" | "WEEKLY" | "MONTHLY";
		periodStart: string;
		periodEnd: string;
		value: number;
		numerator: number | null;
		denominator: number | null;
		computedAt: string;
	} | null;
};

export class MetricsService {
	static async getMetrics(): Promise<Metric[]> {
		return ApiClient.get<Metric[]>("/api/metrics");
	}

	static async updateMetricStatus(
		id: string,
		status: boolean,
	): Promise<Metric> {
		return ApiClient.patch<Metric, { status: boolean }>(
			`/api/metrics/${id}/status`,
			{ status },
		);
	}

	static async getOrganizationMetrics(
		organizationId: string,
	): Promise<OrganizationMetricCatalogItem[]> {
		return ApiClient.get<OrganizationMetricCatalogItem[]>(
			`/api/metrics/organizations/${organizationId}`,
		);
	}

	static async upsertOrganizationMetric(
		organizationId: string,
		payload: {
			metricId: string;
			goal: number;
			isActive?: boolean;
		},
	) {
		return ApiClient.post(
			`/api/metrics/organizations/${organizationId}`,
			payload,
		);
	}

	static async updateOrganizationMetric(
		organizationId: string,
		metricId: string,
		payload: {
			goal?: number;
			isActive?: boolean;
		},
	) {
		return ApiClient.patch(
			`/api/metrics/organizations/${organizationId}/${metricId}`,
			payload,
		);
	}
}
