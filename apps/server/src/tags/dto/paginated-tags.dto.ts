import { ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums } from "@repo/db";
import { Transform, Type } from "class-transformer";
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	Max,
	Min,
} from "class-validator";

export class PaginatedTagsQueryDto {
	@ApiPropertyOptional({
		description: "Search by tag name or description",
		example: "license",
	})
	@IsOptional()
	search?: string;

	@ApiPropertyOptional({
		description: "Filter by tag type (task type)",
		enum: Object.values($Enums.TagType),
		example: "COMPLIANCE",
	})
	@IsOptional()
	@IsEnum($Enums.TagType)
	type?: $Enums.TagType;

	@ApiPropertyOptional({
		description:
			"Filter by active status. true = active, false = inactive. Omit for all.",
		example: true,
	})
	@IsOptional()
	@Transform(({ value }) => {
		if (value === undefined || value === null) return undefined;
		if (value === "true" || value === true) return true;
		if (value === "false" || value === false) return false;
		return undefined;
	})
	@IsBoolean()
	showOnSubmission?: boolean;

	@ApiPropertyOptional({ default: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 10;
}
