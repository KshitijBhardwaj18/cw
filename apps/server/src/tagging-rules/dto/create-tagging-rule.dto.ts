import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums } from "@repo/db";
import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
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

export type QuestionSourceType = "OCCUPATION" | "SPECIALTY";

export class CreateTaggingRuleDto {
	@ApiProperty({ description: "Rule name", example: "ICU Experience Tag" })
	@IsNotEmpty({ message: "Rule name is required" })
	@IsString()
	@MinLength(1, { message: "Rule name is required" })
	ruleName: string;

	@ApiProperty({
		description: "Question source type",
		enum: ["OCCUPATION", "SPECIALTY"],
	})
	@IsNotEmpty({ message: "Question source type is required" })
	@IsString()
	questionSourceType: QuestionSourceType;

	@ApiPropertyOptional({
		description:
			"Organization occupation ID (required when source is OCCUPATION)",
	})
	@IsOptional()
	@IsUUID()
	organizationOccupationId?: string;

	@ApiPropertyOptional({
		description:
			"Organization specialty ID (required when source is SPECIALTY)",
	})
	@IsOptional()
	@IsUUID()
	organizationSpecialtyId?: string;

	@ApiProperty({ description: "Trigger question ID" })
	@IsNotEmpty({ message: "Trigger question is required" })
	@IsUUID()
	questionId: string;

	@ApiProperty({
		description: "Condition type",
		enum: CONDITION_VALUES,
	})
	@IsEnum($Enums.ConditionType, {
		message: `Condition must be one of: ${CONDITION_VALUES.join(", ")}`,
	})
	condition: (typeof CONDITION_VALUES)[number];

	@ApiProperty({ description: "Trigger value", example: "ICU, Yes, 5" })
	@IsNotEmpty({ message: "Trigger value is required" })
	@IsString()
	@MinLength(1, { message: "Trigger value is required" })
	triggerValue: string;

	@ApiProperty({ description: "Tag ID to apply" })
	@IsNotEmpty({ message: "Tag to apply is required" })
	@IsUUID()
	tagId: string;

	@ApiProperty({
		description: "Category",
		example: "Nursing",
		enum: ["Nursing", "ICU", "Credentials"],
	})
	@IsNotEmpty({ message: "Category is required" })
	@IsString()
	@MinLength(1, { message: "Category is required" })
	category: string;

	@ApiPropertyOptional({
		description: "Show on submission",
		default: false,
	})
	@IsOptional()
	@IsBoolean()
	showOnSubmission?: boolean;
}
