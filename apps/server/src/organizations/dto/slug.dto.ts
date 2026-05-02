import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
} from "class-validator";

export class SlugSuggestQueryDto {
	@ApiProperty({
		description: "Organization name to generate a slug preview for",
		example: "Acme Health Network",
	})
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@ApiPropertyOptional({
		description:
			"Organization ID to exclude from the uniqueness check — pass the current org's ID in edit flows so its own slug is not treated as taken",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	@IsOptional()
	@IsUUID()
	excludeOrganizationId?: string;
}
