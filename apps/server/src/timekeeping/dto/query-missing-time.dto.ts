import { ApiPropertyOptional } from "@nestjs/swagger";
import { MissingTimeCaseStatus } from "@repo/db";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class QueryMissingTimeDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	search?: string;

	@ApiPropertyOptional({ enum: MissingTimeCaseStatus })
	@IsOptional()
	@IsEnum(MissingTimeCaseStatus)
	status?: MissingTimeCaseStatus;

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
