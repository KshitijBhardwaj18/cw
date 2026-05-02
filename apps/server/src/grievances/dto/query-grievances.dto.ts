import { ApiPropertyOptional } from "@nestjs/swagger";
import { GrievanceStatus, GrievanceType } from "@repo/db";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export class QueryGrievancesDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Transform(({ value }) =>
		typeof value === "string" ? value.trim() || undefined : value,
	)
	search?: string;

	@ApiPropertyOptional({ enum: GrievanceType })
	@IsOptional()
	@IsEnum(GrievanceType)
	type?: GrievanceType;

	@ApiPropertyOptional({ enum: GrievanceStatus })
	@IsOptional()
	@IsEnum(GrievanceStatus)
	status?: GrievanceStatus;

	@ApiPropertyOptional({ default: DEFAULT_PAGE, minimum: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({
		default: DEFAULT_LIMIT,
		minimum: 1,
		maximum: 100,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;
}

export const GRIEVANCES_LIST_DEFAULT_PAGE = DEFAULT_PAGE;
export const GRIEVANCES_LIST_DEFAULT_LIMIT = DEFAULT_LIMIT;
