import type {
	RequisitionAttentionRuleKey,
	RequisitionAttentionRuleUnit,
} from "@repo/shared";
import { ApiClient } from "@/lib/api-client";

export interface RequisitionAttentionRule {
	key: `${RequisitionAttentionRuleKey}`;
	thresholdValue: number;
	thresholdUnit: `${RequisitionAttentionRuleUnit}`;
	isEnabled: boolean;
	isConfigured?: boolean;
}

export interface RequisitionAttentionRulesResponse {
	rules: RequisitionAttentionRule[];
}

export interface UpsertRequisitionAttentionRulesPayload {
	rules: RequisitionAttentionRule[];
}

export class RequisitionAttentionRulesService {
	static async list(
		organizationId: string,
	): Promise<RequisitionAttentionRulesResponse> {
		return ApiClient.get<RequisitionAttentionRulesResponse>(
			`/api/${organizationId}/requisition-attention-rules`,
		);
	}

	static async upsert(
		organizationId: string,
		payload: UpsertRequisitionAttentionRulesPayload,
	): Promise<RequisitionAttentionRulesResponse> {
		return ApiClient.put<RequisitionAttentionRulesResponse>(
			`/api/${organizationId}/requisition-attention-rules`,
			payload,
		);
	}
}
