import { ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums, type TagType } from "@repo/db";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";

const TAG_TYPE_VALUES = Object.values($Enums.TagType);

export class UpdateTagDto {
	@ApiPropertyOptional({
		description: "Tag name",
		example: "Compact License",
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({
		description: "Tag type (task type)",
		enum: TAG_TYPE_VALUES,
		example: "COMPLIANCE",
	})
	@IsOptional()
	@IsEnum($Enums.TagType, {
		message: `Tag type must be one of: ${TAG_TYPE_VALUES.join(", ")}`,
	})
	type?: TagType;

	@ApiPropertyOptional({
		description: "Tag description",
		example: "Holds license in all states listed under compact license.",
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({
		description:
			"Active status (show on submission). When true, tag is active.",
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	showOnSubmission?: boolean;
}
