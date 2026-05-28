import { ApiProperty } from "@nestjs/swagger";
import {
	RequisitionAttentionRuleKey,
	RequisitionAttentionRuleUnit,
} from "@repo/db";

export class RequisitionAttentionRuleResponseDto {
	@ApiProperty({ enum: RequisitionAttentionRuleKey })
	key: RequisitionAttentionRuleKey;

	@ApiProperty()
	thresholdValue: number;

	@ApiProperty({ enum: RequisitionAttentionRuleUnit })
	thresholdUnit: RequisitionAttentionRuleUnit;

	@ApiProperty()
	isEnabled: boolean;

	@ApiProperty({
		description:
			"True when the org has saved this rule; false when defaults are being shown for UX seeding.",
	})
	isConfigured: boolean;
}

export class RequisitionAttentionRulesResponseDto {
	@ApiProperty({ type: [RequisitionAttentionRuleResponseDto] })
	rules: RequisitionAttentionRuleResponseDto[];
}
