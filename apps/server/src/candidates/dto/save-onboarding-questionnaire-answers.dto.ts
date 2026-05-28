import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	IsArray,
	IsString,
	IsUUID,
	MaxLength,
	ValidateNested,
} from "class-validator";

export class OnboardingQuestionnaireAnswerDto {
	@ApiProperty()
	@IsUUID()
	questionId!: string;

	@ApiProperty()
	@Transform(({ value }) =>
		typeof value === "string" ? value : String(value ?? ""),
	)
	@IsString()
	@MaxLength(10_000)
	value!: string;
}

export class SaveOnboardingQuestionnaireAnswersDto {
	@ApiProperty({ type: [OnboardingQuestionnaireAnswerDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OnboardingQuestionnaireAnswerDto)
	answers!: OnboardingQuestionnaireAnswerDto[];
}
