import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums, type TagType } from "@repo/db";
import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

const TAG_TYPE_VALUES = Object.values($Enums.TagType);

export class CreateTagDto {
	@ApiProperty({
		description: "Tag name",
		example: "Compact License",
	})
	@IsNotEmpty({ message: "Tag name is required" })
	@IsString()
	name: string;

	@ApiProperty({
		description: "Tag type (task type)",
		enum: TAG_TYPE_VALUES,
		example: "COMPLIANCE",
	})
	@IsEnum($Enums.TagType, {
		message: `Tag type must be one of: ${TAG_TYPE_VALUES.join(", ")}`,
	})
	type: TagType;

	@ApiPropertyOptional({
		description: "Tag description",
		example: "Holds license in all states listed under compact license.",
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		description:
			"Active status (show on submission). When true, tag is active.",
		default: true,
		example: true,
	})
	@IsBoolean()
	showOnSubmission: boolean;
}
