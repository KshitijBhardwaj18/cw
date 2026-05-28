import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryVendorSubmittableCandidatesDto {
	@ApiPropertyOptional({ minimum: 1, default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;

	@ApiPropertyOptional({ description: "Search name, email, or specialty" })
	@IsOptional()
	@IsString()
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	search?: string;
}
