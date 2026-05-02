import { ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums } from "@repo/db";
import {
	IsBoolean,
	IsEnum,
	IsOptional,
	IsString,
	IsUUID,
	MinLength,
} from "class-validator";

const CONDITION_VALUES = [
	$Enums.ConditionType.EQUALS,
	$Enums.ConditionType.CONTAINS,
	$Enums.ConditionType.LESS_THAN,
	$Enums.ConditionType.GREATER_THAN,
	$Enums.ConditionType.NOT_EQUALS,
] as const;

export class UpdateTaggingRuleDto {
	@ApiPropertyOptional({ description: "Rule name" })
	@IsOptional()
	@IsString()
	@MinLength(1, { message: "Rule name is required" })
	ruleName?: string;

	@ApiPropertyOptional({ description: "Trigger question ID" })
	@IsOptional()
	@IsUUID()
	questionId?: string;

	@ApiPropertyOptional({
		description: "Condition type",
		enum: CONDITION_VALUES,
	})
	@IsOptional()
	@IsEnum($Enums.ConditionType)
	condition?: (typeof CONDITION_VALUES)[number];

	@ApiPropertyOptional({ description: "Trigger value" })
	@IsOptional()
	@IsString()
	@MinLength(1, { message: "Trigger value is required" })
	triggerValue?: string;

	@ApiPropertyOptional({ description: "Tag ID to apply" })
	@IsOptional()
	@IsUUID()
	tagId?: string;

	@ApiPropertyOptional({ description: "Category" })
	@IsOptional()
	@IsString()
	@MinLength(1, { message: "Category is required" })
	category?: string;

	@ApiPropertyOptional({ description: "Show on submission" })
	@IsOptional()
	@IsBoolean()
	showOnSubmission?: boolean;
}
