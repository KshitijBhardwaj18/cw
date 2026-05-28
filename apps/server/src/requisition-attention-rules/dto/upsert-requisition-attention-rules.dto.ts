import { ApiProperty } from "@nestjs/swagger";
import {
	RequisitionAttentionRuleKey,
	RequisitionAttentionRuleUnit,
} from "@repo/db";
import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	Max,
	Min,
	ValidateNested,
} from "class-validator";

export class RequisitionAttentionRuleInputDto {
	@ApiProperty({ enum: RequisitionAttentionRuleKey })
	@IsEnum(RequisitionAttentionRuleKey)
	key: RequisitionAttentionRuleKey;

	@ApiProperty({ minimum: 1, maximum: 365 })
	@IsInt()
	@Min(1)
	@Max(365)
	thresholdValue: number;

	@ApiProperty({ enum: RequisitionAttentionRuleUnit })
	@IsEnum(RequisitionAttentionRuleUnit)
	thresholdUnit: RequisitionAttentionRuleUnit;

	@ApiProperty()
	@IsBoolean()
	isEnabled: boolean;
}

export class UpsertRequisitionAttentionRulesDto {
	@ApiProperty({ type: [RequisitionAttentionRuleInputDto] })
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => RequisitionAttentionRuleInputDto)
	rules: RequisitionAttentionRuleInputDto[];
}
