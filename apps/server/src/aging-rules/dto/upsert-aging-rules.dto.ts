import { ApiProperty } from "@nestjs/swagger";
import { AgingRuleStageTransition, AgingRuleUnit } from "@repo/db";
import { Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	Max,
	Min,
	ValidateNested,
} from "class-validator";

export class AgingRuleInputDto {
	@ApiProperty({ enum: AgingRuleStageTransition })
	@IsEnum(AgingRuleStageTransition)
	stageTransition: AgingRuleStageTransition;

	@ApiProperty({ minimum: 1, maximum: 365 })
	@IsInt()
	@Min(1)
	@Max(365)
	thresholdValue: number;

	@ApiProperty({ enum: AgingRuleUnit })
	@IsEnum(AgingRuleUnit)
	thresholdUnit: AgingRuleUnit;

	@ApiProperty()
	@IsBoolean()
	isEnabled: boolean;
}

export class UpsertAgingRulesDto {
	@ApiProperty({
		type: [AgingRuleInputDto],
		description: "Partial subset is allowed — only sent rules are upserted.",
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => AgingRuleInputDto)
	rules: AgingRuleInputDto[];
}
