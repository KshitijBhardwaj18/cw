import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	ArrayNotEmpty,
	IsArray,
	IsOptional,
	IsString,
	IsUUID,
} from "class-validator";

export class BulkTagWorkforceListDto {
	@ApiProperty({ description: "Tag name to apply" })
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	tagName: string;

	@ApiPropertyOptional({
		description:
			"Optional list member IDs (if omitted, tag will be applied to all members)",
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@ArrayNotEmpty()
	@IsUUID("4", { each: true })
	memberIds?: string[];
}
