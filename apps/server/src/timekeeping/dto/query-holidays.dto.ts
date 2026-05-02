import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryHolidaysDto {
	@ApiPropertyOptional({
		description: "Filter holidays for this calendar year",
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(2000)
	@Max(2100)
	year?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	search?: string;

	@ApiPropertyOptional({ default: 1, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;
}
