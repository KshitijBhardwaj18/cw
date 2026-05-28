import type { AgingRuleStageTransition, AgingRuleUnit } from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

export interface AgingRule {
	stageTransition: `${AgingRuleStageTransition}`;
	thresholdValue: number;
	thresholdUnit: `${AgingRuleUnit}`;
	isEnabled: boolean;
	isConfigured?: boolean;
}

export interface AgingRulesResponse {
	rules: AgingRule[];
}

export interface UpsertAgingRulesPayload {
	rules: AgingRule[];
}

export class AgingRulesService {
	static async list(organizationId: string): Promise<AgingRulesResponse> {
		return ApiClient.get<AgingRulesResponse>(
			`/api/${organizationId}/aging-rules`,
		);
	}

	static async upsert(
		organizationId: string,
		payload: UpsertAgingRulesPayload,
	): Promise<AgingRulesResponse> {
		return ApiClient.put<AgingRulesResponse>(
			`/api/${organizationId}/aging-rules`,
			payload,
		);
	}

	static async deleteOne(
		organizationId: string,
		stageTransition: `${AgingRuleStageTransition}`,
	): Promise<void> {
		await ApiClient.delete<void>(
			`/api/${organizationId}/aging-rules/${stageTransition}`,
		);
	}
}
