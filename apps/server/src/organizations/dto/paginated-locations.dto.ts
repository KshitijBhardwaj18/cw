import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class PaginatedLocationsQueryDto {
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
		description: "Search by name, address, city, state, or zip code",
	})
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : undefined,
	)
	@IsString()
	search?: string;
}
