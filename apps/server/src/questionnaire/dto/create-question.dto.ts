import { ApiProperty } from "@nestjs/swagger";
import { QuestionType } from "@repo/db";
import { Transform } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class CreateQuestionDto {
	@ApiProperty({
		description: "Question text",
		example: "In which states do you hold an active RN license?",
	})
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	questionText: string;

	@ApiProperty({
		description: "Question type",
		enum: QuestionType,
		example: QuestionType.CHECKBOX,
	})
	@IsEnum(QuestionType)
	type: QuestionType;

	@ApiProperty({
		description: "Options for non-text question types (empty for TEXT)",
		type: [String],
		example: ["Option 1", "Option 2"],
	})
	@Transform(({ value }) =>
		Array.isArray(value)
			? value.map((v: unknown) => (typeof v === "string" ? v.trim() : v))
			: value,
	)
	@IsArray()
	@IsString({ each: true })
	options: string[];

	@ApiProperty({
		description: "Whether the question is required",
		default: false,
	})
	@IsBoolean()
	@IsOptional()
	required?: boolean;

	@ApiProperty({
		description: "Include in submission readiness screen",
		default: false,
	})
	@IsBoolean()
	@IsOptional()
	includeInSubmission?: boolean;
}
