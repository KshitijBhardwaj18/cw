import { ApiPropertyOptional } from "@nestjs/swagger";
import { $Enums } from "@repo/db";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class PaginatedOrganizationsQueryDto {
	@ApiPropertyOptional({ default: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page = 1;

	@ApiPropertyOptional({ default: 8, minimum: 1, maximum: 100 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit = 8;

	@ApiPropertyOptional({
		enum: $Enums.OrganizationType,
		description: "Filter by organization type",
	})
	@IsOptional()
	@IsEnum($Enums.OrganizationType)
	organizationType?: $Enums.OrganizationType;

	@ApiPropertyOptional({ description: "Search by name, email, or website" })
	@IsOptional()
	@IsString()
	search?: string;
}
