import { ApiProperty } from "@nestjs/swagger";
import { AgingRuleStageTransition, AgingRuleUnit } from "@repo/db";

export class AgingRuleResponseDto {
	@ApiProperty({ enum: AgingRuleStageTransition })
	stageTransition: AgingRuleStageTransition;

	@ApiProperty()
	thresholdValue: number;

	@ApiProperty({ enum: AgingRuleUnit })
	thresholdUnit: AgingRuleUnit;

	@ApiProperty()
	isEnabled: boolean;

	@ApiProperty({
		description:
			"True when the org has saved this rule; false when defaults are being shown for UX seeding.",
	})
	isConfigured: boolean;
}

export class AgingRulesResponseDto {
	@ApiProperty({ type: [AgingRuleResponseDto] })
	rules: AgingRuleResponseDto[];
}
